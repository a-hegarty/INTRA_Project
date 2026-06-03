from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(User)
admin.site.register(Cuisine)
admin.site.register(Ingredient)
admin.site.register(Recipe)
admin.site.register(Diet)
admin.site.register(Tags)
