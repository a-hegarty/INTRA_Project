from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from .forms import *
from .models import *

# Create your views here.
def index(request):
    return render(request, "index.html")

def createrecipe(request):
    if request.method == "POST":
        form = AddRecipeForm(request.POST)
        if form.is_valid():
            recipe = form.save()
            return render(request, "createrecipe.html")
        
def search(request):
    all_recipies = Recipe.objects.all()
    return render (request, "search.html", {'recipies':all_recipies})

def profile(request):
    return render (request, "profile.html")

def api_ingredients(request):
    ingredients = list(Ingredient.objects.values('id', 'name'))
    return JsonResponse(ingredients, safe=False)

def _serialize_recipe(recipe, request):
    ingredient_names = [ing.name for ing in recipe.ingredients.all()]
    image_url = request.build_absolute_uri(recipe.image.url) if recipe.image else None
    return {
        'id': recipe.id,
        'name': recipe.name,
        'time': recipe.time,
        'instructions': recipe.instructions,
        'ingredients': ingredient_names,
        'calories': recipe.calories,
        'protein': recipe.protein,
        'carbs': recipe.carbs,
        'image_url': image_url,
    }


def api_recipes(request):
    recipes_queryset = Recipe.objects.all().prefetch_related('ingredients')
    recipes_list = [_serialize_recipe(recipe, request) for recipe in recipes_queryset]
    return JsonResponse(recipes_list, safe=False)