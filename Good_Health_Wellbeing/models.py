from django.db import models

# model of end user
class User(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, default='anonymoususer')

    def __str__(self):
        return self.username
    
class Ingredient(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(default='')

    def __str__(self):
        return self.name
    
class Cuisine(models.Model):
    id = models.AutoField
    name = models.CharField(default="")
        
    def __str__(self):
        return self.name
    
class Diet(models.Model):
    id = models.AutoField
    name = models.CharField(default="")
        
    def __str__(self):
        return self.name

class Tags(models.Model):
    id = models.AutoField
    name = models.CharField(default="")
        
    def __str__(self):
        return self.name
    
class Recipe(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(default='')
    cuisine = models.ForeignKey(Cuisine, on_delete=models.CASCADE)
    diet = models.ManyToManyField(Diet)
    tags = models.ManyToManyField(Tags)
    time = models.TimeField()
    ingredients = models.ManyToManyField(Ingredient)
    instructions = models.CharField(default='')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
