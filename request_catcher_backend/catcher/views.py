

# catcher/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from .models import Catcher, RequestLog
from .serializers import RequestLogSerializer
from django.http import JsonResponse
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

import uuid
import datetime

class CreateCatcherView(APIView):
    def post(self, request):
        catcher = Catcher.objects.create()
        return Response({"catcher_id": str(catcher.catcher_id)})
'''

# Storing in databse 
class CatcherEndpointView(APIView):
    def dispatch(self, request, *args, **kwargs):
        catcher_id = kwargs.get("catcher_id")
        try:
            catcher = Catcher.objects.get(catcher_id=catcher_id)
        except Catcher.DoesNotExist:
            return Response({"error": "Invalid catcher ID"}, status=404)

        RequestLog.objects.create(
            catcher=catcher,
            method=request.method,
            headers=dict(request.headers),
            query_params=request.GET.dict(),
            body=request.body.decode("utf-8", errors="ignore")
        )
        return JsonResponse({"message": "Request captured"})

'''


class CatcherEndpointView(APIView):
    def dispatch(self, request, *args, **kwargs):
        catcher_id = kwargs.get("catcher_id")

        try:
            Catcher.objects.get(catcher_id=catcher_id)  # Still validate
        except Catcher.DoesNotExist:
            return Response({"error": "Invalid catcher ID"}, status=404)

        # Build the log data
        log_data = {
            "method": request.method,
            "headers": dict(request.headers),
            "query_params": request.GET.dict(),
            "body": request.body.decode("utf-8", errors="ignore"),
            "timestamp": str(datetime.datetime.utcnow())
        }

        # Send to WebSocket channel
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"catcher_{catcher_id}",
            {
                "type": "send.log",
                "log": log_data,
            }
        )

        return JsonResponse({"message": "Request captured and broadcasted"})

class CatcherLogsView(ListAPIView):
    serializer_class = RequestLogSerializer

    def get_queryset(self):
        catcher_id = self.kwargs['catcher_id']
        return RequestLog.objects.filter(catcher__catcher_id=catcher_id).order_by('-timestamp')
