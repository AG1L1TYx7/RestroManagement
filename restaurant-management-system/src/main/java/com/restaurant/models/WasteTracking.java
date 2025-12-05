package com.restaurant.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WasteTracking {
    private int wasteId;
    private int branchId;
    private Branch branch;
    private int ingredientId;
    private Ingredient ingredient;
    private BigDecimal quantity;
    private String reason;
    private BigDecimal estimatedCost;
    private int reportedBy;
    private User reportedByUser;
    private LocalDateTime wasteDate;
    private String notes;

    // Constructors
    public WasteTracking() {}

    public WasteTracking(int wasteId, int branchId, int ingredientId) {
        this.wasteId = wasteId;
        this.branchId = branchId;
        this.ingredientId = ingredientId;
    }

    // Getters and Setters
    public int getWasteId() {
        return wasteId;
    }

    public void setWasteId(int wasteId) {
        this.wasteId = wasteId;
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

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public BigDecimal getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(BigDecimal estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public int getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(int reportedBy) {
        this.reportedBy = reportedBy;
    }

    public User getReportedByUser() {
        return reportedByUser;
    }

    public void setReportedByUser(User reportedByUser) {
        this.reportedByUser = reportedByUser;
        if (reportedByUser != null) {
            this.reportedBy = reportedByUser.getUserId();
        }
    }

    public LocalDateTime getWasteDate() {
        return wasteDate;
    }

    public void setWasteDate(LocalDateTime wasteDate) {
        this.wasteDate = wasteDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Business methods
    public void calculateCost() {
        if (ingredient != null && quantity != null) {
            this.estimatedCost = ingredient.getCostPerUnit().multiply(quantity);
        }
    }

    public boolean isExpired() {
        return "expired".equalsIgnoreCase(reason);
    }

    public boolean isSpoiled() {
        return "spoiled".equalsIgnoreCase(reason);
    }

    @Override
    public String toString() {
        String ingredientName = ingredient != null ? ingredient.getIngredientName() : "Ingredient #" + ingredientId;
        return quantity + " " + (ingredient != null ? ingredient.getUnit() : "units") + " of " + ingredientName + " - " + reason;
    }
}
