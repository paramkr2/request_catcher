
# project/asgi.py
import os
import django
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from catcher.routing import websocket_urlpatterns

print(">>> Starting ASGI application...")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'request_catcher_project.settings')
django.setup()

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})

print(">>> ASGI router loaded")