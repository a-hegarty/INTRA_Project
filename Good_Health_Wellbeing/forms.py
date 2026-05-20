from django import forms
from .models import *

class AddRecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe
        fields = [
            'name',
            'cuisine',
            'diet'
            'tags',
            'ingredients',
            'instructions'
        ]