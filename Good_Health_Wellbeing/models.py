from django.db import models

# model of end user
class User(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, default='anonymoususer')

    def __str__(self):
        return self.username
    
class IngredientCategory(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, default='')

    def __str__(self):
        return self.name
    
class Ingredient(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, default='')

    def __str__(self):
        return self.name
    
class Equipment(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, default='')

    def __str__(self):
        return self.name
    
class Cuisine(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, default="")
        
    def __str__(self):
        return self.name
    
class Diet(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, default="")
        
    def __str__(self):
        return self.name

class Tags(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, default="")
        
    def __str__(self):
        return self.name
    
class Recipe(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, default='')
    calories = models.IntegerField()
    portions = models.IntegerField()
    cuisine = models.ForeignKey(Cuisine, on_delete=models.CASCADE)
    diet = models.ManyToManyField(Diet)
    tags = models.ManyToManyField(Tags)
    time = models.IntegerField()
    equipment = models.ManyToManyField(Equipment)
    ingredients = models.ManyToManyField(Ingredient)
    instructions = models.TextField(default='')
    photos = models.ImageField(default='image.jpg')
    author = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.name
