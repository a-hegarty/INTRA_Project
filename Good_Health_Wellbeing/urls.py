from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('createrecipe', views.createrecipe, name="createrecipe"),
    path('search', views.search, name="search"),
    # path('view_recipe', views.view_recipe, name="view_recipe"),
]