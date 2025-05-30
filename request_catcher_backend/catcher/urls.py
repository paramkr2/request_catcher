from django.urls import path, re_path

from .views import CreateCatcherView, CatcherEndpointView, CatcherLogsView

urlpatterns = [
    path('create-catcher/', CreateCatcherView.as_view(), name='create-catcher'),
    path('catcher/<uuid:catcher_id>/', CatcherEndpointView.as_view(), name='catcher-endpoint'),
    path('logs/<uuid:catcher_id>/', CatcherLogsView.as_view(), name='catcher-logs'),
]
