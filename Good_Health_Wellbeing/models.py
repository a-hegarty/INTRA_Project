from django.db import models

# model of end user
class User(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50)

    def __str__(self):
        return self.username
    
class Ingredient(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField()

    def __str__(self):
        return self.name
    
class Cuisine(models.Model):
    id = models.AutoField
    
class Recipe(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField()
    cuisine = models.CharField()
    diet = models.CharField()
    tags = models.CharField()
    time = models.TimeField()
    ingredients = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    instructions = models.CharField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
