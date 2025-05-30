from catcher.consumers import CatcherConsumer, TestConsumer
from django.urls import path, re_path

websocket_urlpatterns = [
    re_path(r'^ws/test/$', TestConsumer.as_asgi()),  # TEMP TEST ROUTE
    re_path(r"^ws/catcher/(?P<catcher_id>[0-9a-f\-]+)/$", CatcherConsumer.as_asgi()),
]
