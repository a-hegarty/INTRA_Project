from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('createrecipe', views.createrecipe, name="createrecipe"),
    path('api', views.api, name="api"),
]