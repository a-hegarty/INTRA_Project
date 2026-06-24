from django.db import models

# model of end user
class User(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, default='anonymoususer')

    def __str__(self):
        return self.username
    
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
    calories = models.IntegerField(default=0)
    protein = models.IntegerField(default=0)
    carbs = models.IntegerField(default=0)
    #portions = models.IntegerField()
    cuisine = models.ForeignKey(Cuisine, on_delete=models.CASCADE)
    diet = models.ManyToManyField(Diet)
    tags = models.ManyToManyField(Tags)
    time = models.IntegerField()
    #equipment = models.ManyToManyField(Equipment)
    ingredients = models.ManyToManyField(Ingredient)
    instructions = models.TextField(default='')
    image = models.ImageField(upload_to='recipes/', blank=True, null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.name
