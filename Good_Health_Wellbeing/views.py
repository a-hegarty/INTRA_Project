from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def index(request):
    return render(request, "index.html")

#page to view list of recipies
def view_recipe_list(request):
    all_recipies = 