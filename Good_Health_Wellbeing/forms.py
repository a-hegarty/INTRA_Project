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
            'time',
            'ingredients',
            'instructions'
        ]

    def clean(self):
        data = self.cleaned_data
        name = data['name']
        cuisine = data['cuisine']
        diet = data['diet']
        tags = data['tags']
        time = data["time"]
        ingredients = data['ingredients']
        instructions = data['instructions']
        return data