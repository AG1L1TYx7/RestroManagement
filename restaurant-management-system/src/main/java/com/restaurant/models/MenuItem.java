package com.restaurant.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MenuItem {
    private int itemId;
    private String itemName;
    private String description;
    private int categoryId;
    private Category category;
    private BigDecimal price;
    private BigDecimal cost;
    private String imageUrl;
    private boolean available;
    private boolean featured;
    private int preparationTime;
    private String allergens;
    private int calories;
    private boolean isVegetarian;
    private boolean isVegan;
    private boolean isGlutenFree;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public MenuItem() {}

    public MenuItem(int itemId, String itemName, BigDecimal price) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.price = price;
    }

    // Getters and Setters
    public int getItemId() {
        return itemId;
    }

    public void setItemId(int itemId) {
        this.itemId = itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    // Alias methods for convenience
    public String getName() {
        return itemName;
    }

    public void setName(String name) {
        this.itemName = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(int categoryId) {
        this.categoryId = categoryId;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
        if (category != null) {
            this.categoryId = category.getCategoryId();
        }
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getCost() {
        return cost;
    }

    public void setCost(BigDecimal cost) {
        this.cost = cost;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public int getPreparationTime() {
        return preparationTime;
    }

    public void setPreparationTime(int preparationTime) {
        this.preparationTime = preparationTime;
    }

    public String getAllergens() {
        return allergens;
    }

    public void setAllergens(String allergens) {
        this.allergens = allergens;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public boolean isVegetarian() {
        return isVegetarian;
    }

    public void setVegetarian(boolean vegetarian) {
        isVegetarian = vegetarian;
    }

    public boolean isVegan() {
        return isVegan;
    }

    public void setVegan(boolean vegan) {
        isVegan = vegan;
    }

    public boolean isGlutenFree() {
        return isGlutenFree;
    }

    public void setGlutenFree(boolean glutenFree) {
        isGlutenFree = glutenFree;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Business methods
    public BigDecimal getProfitMargin() {
        if (cost != null && price != null && cost.compareTo(BigDecimal.ZERO) > 0) {
            return price.subtract(cost).divide(cost, 2, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }
        return BigDecimal.ZERO;
    }

    public boolean hasAllergen(String allergen) {
        return allergens != null && allergens.toLowerCase().contains(allergen.toLowerCase());
    }

    @Override
    public String toString() {
        return itemName + " - $" + price;
    }
}
