package com.restaurant.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockTransaction {
    private int transactionId;
    private int inventoryId;
    private Inventory inventory;
    private String transactionType;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private String referenceType;
    private int referenceId;
    private int performedBy;
    private User performedByUser;
    private String notes;
    private LocalDateTime transactionDate;

    // Constructors
    public StockTransaction() {}

    public StockTransaction(int transactionId, int inventoryId, String transactionType) {
        this.transactionId = transactionId;
        this.inventoryId = inventoryId;
        this.transactionType = transactionType;
    }

    // Getters and Setters
    public int getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(int transactionId) {
        this.transactionId = transactionId;
    }

    public int getInventoryId() {
        return inventoryId;
    }

    public void setInventoryId(int inventoryId) {
        this.inventoryId = inventoryId;
    }

    public Inventory getInventory() {
        return inventory;
    }

    public void setInventory(Inventory inventory) {
        this.inventory = inventory;
        if (inventory != null) {
            this.inventoryId = inventory.getInventoryId();
        }
    }

    public String getTransactionType() {
        return transactionType;
    }

    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public int getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(int referenceId) {
        this.referenceId = referenceId;
    }

    public int getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(int performedBy) {
        this.performedBy = performedBy;
    }

    public User getPerformedByUser() {
        return performedByUser;
    }

    public void setPerformedByUser(User performedByUser) {
        this.performedByUser = performedByUser;
        if (performedByUser != null) {
            this.performedBy = performedByUser.getUserId();
        }
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }

    // Business methods
    public boolean isInbound() {
        return "purchase".equalsIgnoreCase(transactionType) || "restock".equalsIgnoreCase(transactionType);
    }

    public boolean isOutbound() {
        return "sale".equalsIgnoreCase(transactionType) || "waste".equalsIgnoreCase(transactionType);
    }

    public BigDecimal getTotalCost() {
        if (unitCost != null && quantity != null) {
            return unitCost.multiply(quantity);
        }
        return BigDecimal.ZERO;
    }

    @Override
    public String toString() {
        return transactionType + " - " + quantity + " units";
    }
}
