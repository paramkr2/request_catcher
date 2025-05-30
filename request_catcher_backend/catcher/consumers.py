# catcher/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class CatcherConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.catcher_id = self.scope["url_route"]["kwargs"]["catcher_id"]
        self.group_name = f"catcher_{self.catcher_id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def send_log(self, event):
        log = event["log"]
        await self.send(text_data=json.dumps(log))


# catcher/consumers.py
class TestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print(">>> Test WebSocket connected")
        await self.accept()
        await self.send(text_data="Hello from TestConsumer!")
