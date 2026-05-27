from django import forms
from .models import *

class AddRecipeForm(forms.ModelForm):
    class Meta:
        model = Recipe
        fields = [
            'name',
            'cuisine',
            'diet',
            'tags',
            'ingredients',
            'instructions'
        ]

    def clean(self):
        data = self.cleaned_data
        name = data['name']
        cuisine = data['cuisine']
        diet = data['diet']
        tags = data['tags']
        ingredients = data['ingredients']
        instructions = data['instructions']
        return data