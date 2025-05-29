from django.contrib import admin
from .models import Catcher, RequestLog

@admin.register(Catcher)
class CatcherAdmin(admin.ModelAdmin):
    list_display = ('catcher_id', 'created_at')
    search_fields = ('catcher_id',)
    ordering = ('-created_at',)

@admin.register(RequestLog)
class RequestLogAdmin(admin.ModelAdmin):
    list_display = ('catcher', 'method', 'timestamp')
    list_filter = ('method', 'timestamp')
    search_fields = ('catcher__catcher_id', 'method')
    ordering = ('-timestamp',)
