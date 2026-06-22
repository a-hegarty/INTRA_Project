from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('createrecipe', views.createrecipe, name="createrecipe"),
    path('search', views.search, name="search"),
    path('ingredients/', views.api_ingredients, name="api_ingredients"),
    path('recipes/', views.api_recipes, name="api_recipes"),
    path('recipes/create/', views.api_create_recipe, name="api_create_recipe"),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    # path('view_recipe', views.view_recipe, name="view_recipe"),
]