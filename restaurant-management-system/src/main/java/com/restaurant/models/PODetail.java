package com.restaurant.models;

import java.math.BigDecimal;

public class PODetail {
    private int detailId;
    private int poId;
    private PurchaseOrder purchaseOrder;
    private int ingredientId;
    private Ingredient ingredient;
    private BigDecimal orderedQuantity;
    private BigDecimal receivedQuantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private String notes;

    // Constructors
    public PODetail() {}

    public PODetail(int detailId, int poId, int ingredientId) {
        this.detailId = detailId;
        this.poId = poId;
        this.ingredientId = ingredientId;
    }

    // Getters and Setters
    public int getDetailId() {
        return detailId;
    }

    public void setDetailId(int detailId) {
        this.detailId = detailId;
    }

    public int getPoId() {
        return poId;
    }

    public void setPoId(int poId) {
        this.poId = poId;
    }

    public PurchaseOrder getPurchaseOrder() {
        return purchaseOrder;
    }

    public void setPurchaseOrder(PurchaseOrder purchaseOrder) {
        this.purchaseOrder = purchaseOrder;
        if (purchaseOrder != null) {
            this.poId = purchaseOrder.getPoId();
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
            this.unitPrice = ingredient.getCostPerUnit();
            calculateSubtotal();
        }
    }

    public BigDecimal getOrderedQuantity() {
        return orderedQuantity;
    }

    public void setOrderedQuantity(BigDecimal orderedQuantity) {
        this.orderedQuantity = orderedQuantity;
        calculateSubtotal();
    }

    public BigDecimal getReceivedQuantity() {
        return receivedQuantity;
    }

    public void setReceivedQuantity(BigDecimal receivedQuantity) {
        this.receivedQuantity = receivedQuantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
        calculateSubtotal();
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Business methods
    private void calculateSubtotal() {
        if (unitPrice != null && orderedQuantity != null) {
            this.subtotal = unitPrice.multiply(orderedQuantity);
        }
    }

    public boolean isFullyReceived() {
        return receivedQuantity != null && receivedQuantity.compareTo(orderedQuantity) >= 0;
    }

    public boolean isPartiallyReceived() {
        return receivedQuantity != null && receivedQuantity.compareTo(BigDecimal.ZERO) > 0 
               && receivedQuantity.compareTo(orderedQuantity) < 0;
    }

    public BigDecimal getPendingQuantity() {
        if (receivedQuantity == null) {
            return orderedQuantity;
        }
        return orderedQuantity.subtract(receivedQuantity);
    }

    @Override
    public String toString() {
        String ingredientName = ingredient != null ? ingredient.getIngredientName() : "Ingredient #" + ingredientId;
        return orderedQuantity + " " + (ingredient != null ? ingredient.getUnit() : "units") + " of " + ingredientName;
    }
}
