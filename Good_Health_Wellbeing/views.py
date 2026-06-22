import json
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import authenticate, get_user_model
from .forms import *
from .models import *

DjangoUser = get_user_model()

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
    diet_names = [d.name for d in recipe.diet.all()]
    tag_names = [t.name for t in recipe.tags.all()]
    image_url = request.build_absolute_uri(recipe.image.url) if recipe.image else None
    return {
        'id': recipe.id,
        'name': recipe.name,
        'time': recipe.time,
        'instructions': recipe.instructions,
        'ingredients': ingredient_names,
        'diets': diet_names,
        'tags': tag_names,
        'calories': recipe.calories,
        'protein': recipe.protein,
        'carbs': recipe.carbs,
        'image_url': image_url,
    }

def api_recipes(request):
    recipes_queryset = Recipe.objects.filter(is_approved=True).prefetch_related('ingredients', 'diet', 'tags')
    recipes_list = [_serialize_recipe(recipe, request) for recipe in recipes_queryset]
    return JsonResponse(recipes_list, safe=False)

@csrf_exempt
@require_http_methods(["POST"])
def api_create_recipe(request):
    content_type = request.content_type or ''
    if 'multipart/form-data' in content_type:
        data = request.POST
        get = lambda key, default='': data.get(key, default)
        ingredient_names = json.loads(data.get('ingredients', '[]'))
        diet_names = json.loads(data.get('diets', '[]'))
        tag_names = json.loads(data.get('tags', '[]'))
        image_file = request.FILES.get('image')
    else:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        get = lambda key, default='': data.get(key, default)
        ingredient_names = data.get('ingredients', [])
        diet_names = data.get('diets', [])
        tag_names = data.get('tags', [])
        image_file = None

    name = get('name', '').strip()
    if not name:
        return JsonResponse({'error': 'name is required'}, status=400)

    try:
        time_val = int(get('time', 0) or 0)
        calories = int(get('calories', 0) or 0)
        protein = int(get('protein', 0) or 0)
        carbs = int(get('carbs', 0) or 0)
    except (ValueError, TypeError):
        return JsonResponse({'error': 'time, calories, protein, carbs must be numbers'}, status=400)

    instructions = get('instructions', '').strip()
    cuisine_name = (get('cuisine', 'General') or 'General').strip()
    username = (get('username', 'anonymoususer') or 'anonymoususer').strip()

    author, _ = DjangoUser.objects.get_or_create(username=username)
    cuisine, _ = Cuisine.objects.get_or_create(name=cuisine_name)

    recipe = Recipe.objects.create(
        name=name,
        time=time_val,
        calories=calories,
        protein=protein,
        carbs=carbs,
        instructions=instructions,
        cuisine=cuisine,
        author=author,
        **({"image": image_file} if image_file else {}),
    )

    for ing_name in ingredient_names:
        ing_name = ing_name.strip()
        if ing_name:
            ingredient, _ = Ingredient.objects.get_or_create(name=ing_name)
            recipe.ingredients.add(ingredient)

    for diet_name in diet_names:
        diet_name = diet_name.strip()
        if diet_name:
            diet, _ = Diet.objects.get_or_create(name=diet_name)
            recipe.diet.add(diet)

    for tag_name in tag_names:
        tag_name = tag_name.strip()
        if tag_name:
            tag, _ = Tags.objects.get_or_create(name=tag_name)
            recipe.tags.add(tag)

    return JsonResponse(_serialize_recipe(recipe, request), status=201)

@csrf_exempt
def register_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if DjangoUser.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already taken'}, status=400)
            
        user = DjangoUser.objects.create_user(username=username, email=email, password=password)
        return JsonResponse({'message': 'User created successfully', 'username': user.username})

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is not None:
            saved_diets = []
            saved_favorites = []
            
            try:
                if hasattr(user, 'profile') and user.profile.dietary_restrictions:
                    saved_diets = [d.name for d in user.profile.dietary_restrictions.all()]
            except Exception:
                pass

            try:
                if hasattr(user, 'favorite_recipes'):
                    saved_favorites = [r.id for r in user.favorite_recipes.all()]
            except Exception:
                pass

            return JsonResponse({
                'authenticated': True, 
                'username': user.username, 
                'email': user.email,
                'diets': saved_diets,
                'favorites': saved_favorites
            })
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=400)