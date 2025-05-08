#!/bin/bash

# Test valid exclusions
curl "http://localhost:5000/api/mealplan?targetCalories=2000&exclude=nuts,dairy"

# Test case where exclusions prevent generation
curl "http://localhost:5000/api/mealplan?targetCalories=2000&exclude=meat,dairy,grains"

# Test invalid exclusions format
curl "http://localhost:5000/api/mealplan?targetCalories=2000&exclude=invalid_ingredient_123"