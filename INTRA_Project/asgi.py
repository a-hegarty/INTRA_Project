"""
ASGI config for INTRA_Project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from django.contrib import admin
from django.urls import path, include

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'INTRA_Project.settings')

application = get_asgi_application()

urlpatterns = [
    path('', include('Good_Health_Wellbeing.urls')),
    path('admin/', admin.site.urls),
]