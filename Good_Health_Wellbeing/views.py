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