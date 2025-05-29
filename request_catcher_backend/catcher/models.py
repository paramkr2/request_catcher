# catcher/models.py
import uuid
from django.db import models

class Catcher(models.Model):
    catcher_id = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

class RequestLog(models.Model):
    catcher = models.ForeignKey(Catcher, on_delete=models.CASCADE, related_name="logs")
    method = models.CharField(max_length=10)
    headers = models.JSONField()
    query_params = models.JSONField()
    body = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
