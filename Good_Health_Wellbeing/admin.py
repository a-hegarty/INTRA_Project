from django.contrib import admin
from django.utils.html import format_html
from .models import *

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ('name', 'time', 'calories', 'protein', 'image_preview')
    readonly_fields = ('image_preview',)
    search_fields = ('name',)
    list_filter = ('cuisine',)

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 80px; border-radius: 8px;" />',
                obj.image.url,
            )
        return 'No image'

    image_preview.short_description = 'Preview'

admin.site.register(User)
admin.site.register(Cuisine)
admin.site.register(Ingredient)
admin.site.register(Diet)
admin.site.register(Tags)
admin.site.register(Equipment)
