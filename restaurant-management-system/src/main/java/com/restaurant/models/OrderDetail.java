package com.restaurant.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderDetail {
    private int detailId;
    private int orderId;
    private Order order;
    private int itemId;
    private MenuItem menuItem;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
    private String specialInstructions;
    private String status;
    private LocalDateTime createdAt;

    // Constructors
    public OrderDetail() {}

    public OrderDetail(int detailId, int orderId, int itemId) {
        this.detailId = detailId;
        this.orderId = orderId;
        this.itemId = itemId;
    }

    // Getters and Setters
    public int getDetailId() {
        return detailId;
    }

    public void setDetailId(int detailId) {
        this.detailId = detailId;
    }

    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
        if (order != null) {
            this.orderId = order.getOrderId();
        }
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
            this.unitPrice = menuItem.getPrice();
            calculateSubtotal();
        }
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
        calculateSubtotal();
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

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Business methods
    private void calculateSubtotal() {
        if (unitPrice != null && quantity > 0) {
            this.subtotal = unitPrice.multiply(new BigDecimal(quantity));
        }
    }

    public boolean isPending() {
        return "pending".equalsIgnoreCase(status);
    }

    public boolean isReady() {
        return "ready".equalsIgnoreCase(status);
    }

    @Override
    public String toString() {
        String itemName = menuItem != null ? menuItem.getItemName() : "Item #" + itemId;
        return quantity + "x " + itemName + " - $" + subtotal;
    }
}
