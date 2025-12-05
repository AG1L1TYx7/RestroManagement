package com.restaurant.models;

import java.math.BigDecimal;

public class Recipe {
    private int recipeId;
    private int itemId;
    private MenuItem menuItem;
    private int ingredientId;
    private Ingredient ingredient;
    private BigDecimal quantityRequired;
    private String notes;

    // Constructors
    public Recipe() {}

    public Recipe(int recipeId, int itemId, int ingredientId) {
        this.recipeId = recipeId;
        this.itemId = itemId;
        this.ingredientId = ingredientId;
    }

    // Getters and Setters
    public int getRecipeId() {
        return recipeId;
    }

    public void setRecipeId(int recipeId) {
        this.recipeId = recipeId;
    }

    public int getItemId() {
        return itemId;
    }

    public void setItemId(int itemId) {
        this.itemId = itemId;
    }

    public MenuItem getMenuItem() {
        return menuItem;
    }

    public void setMenuItem(MenuItem menuItem) {
        this.menuItem = menuItem;
        if (menuItem != null) {
            this.itemId = menuItem.getItemId();
        }
    }

    public int getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(int ingredientId) {
        this.ingredientId = ingredientId;
    }

    public Ingredient getIngredient() {
        return ingredient;
    }

    public void setIngredient(Ingredient ingredient) {
        this.ingredient = ingredient;
        if (ingredient != null) {
            this.ingredientId = ingredient.getIngredientId();
        }
    }

    public BigDecimal getQuantityRequired() {
        return quantityRequired;
    }

    public void setQuantityRequired(BigDecimal quantityRequired) {
        this.quantityRequired = quantityRequired;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Business methods
    public BigDecimal calculateCost() {
        if (ingredient != null && quantityRequired != null) {
            return ingredient.getCostPerUnit().multiply(quantityRequired);
        }
        return BigDecimal.ZERO;
    }

    @Override
    public String toString() {
        String ingredientName = ingredient != null ? ingredient.getIngredientName() : "Ingredient #" + ingredientId;
        return quantityRequired + " " + (ingredient != null ? ingredient.getUnit() : "units") + " of " + ingredientName;
    }
}
