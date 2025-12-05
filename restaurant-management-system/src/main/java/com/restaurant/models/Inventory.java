package com.restaurant.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Inventory {
    private int inventoryId;
    private int branchId;
    private Branch branch;
    private int ingredientId;
    private Ingredient ingredient;
    private BigDecimal currentQuantity;
    private BigDecimal minimumQuantity;
    private BigDecimal maximumQuantity;
    private LocalDateTime lastRestockDate;
    private LocalDateTime expiryDate;
    private String location;
    private LocalDateTime updatedAt;

    // Constructors
    public Inventory() {}

    public Inventory(int inventoryId, int branchId, int ingredientId) {
        this.inventoryId = inventoryId;
        this.branchId = branchId;
        this.ingredientId = ingredientId;
    }

    // Getters and Setters
    public int getInventoryId() {
        return inventoryId;
    }

    public void setInventoryId(int inventoryId) {
        this.inventoryId = inventoryId;
    }

    public int getBranchId() {
        return branchId;
    }

    public void setBranchId(int branchId) {
        this.branchId = branchId;
    }

    public Branch getBranch() {
        return branch;
    }

    public void setBranch(Branch branch) {
        this.branch = branch;
        if (branch != null) {
            this.branchId = branch.getBranchId();
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

    public BigDecimal getCurrentQuantity() {
        return currentQuantity;
    }

    public void setCurrentQuantity(BigDecimal currentQuantity) {
        this.currentQuantity = currentQuantity;
    }

    public BigDecimal getMinimumQuantity() {
        return minimumQuantity;
    }

    public void setMinimumQuantity(BigDecimal minimumQuantity) {
        this.minimumQuantity = minimumQuantity;
    }

    public BigDecimal getMaximumQuantity() {
        return maximumQuantity;
    }

    public void setMaximumQuantity(BigDecimal maximumQuantity) {
        this.maximumQuantity = maximumQuantity;
    }

    public LocalDateTime getLastRestockDate() {
        return lastRestockDate;
    }

    public void setLastRestockDate(LocalDateTime lastRestockDate) {
        this.lastRestockDate = lastRestockDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Business methods
    public boolean isLowStock() {
        return currentQuantity.compareTo(minimumQuantity) <= 0;
    }

    public boolean isExpiringSoon(int daysThreshold) {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDateTime.now().plusDays(daysThreshold));
    }

    public boolean isExpired() {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDateTime.now());
    }

    public BigDecimal getStockPercentage() {
        if (maximumQuantity.compareTo(BigDecimal.ZERO) == 0) return BigDecimal.ZERO;
        return currentQuantity.divide(maximumQuantity, 2, java.math.RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
    }

    @Override
    public String toString() {
        String ingredientName = ingredient != null ? ingredient.getIngredientName() : "Ingredient #" + ingredientId;
        return ingredientName + " - " + currentQuantity + " units";
    }
}
