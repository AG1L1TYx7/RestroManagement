package com.restaurant.models;

import java.time.LocalDateTime;

public class RestaurantTable {
    private int tableId;
    private String tableNumber;
    private int branchId;
    private Branch branch;
    private int capacity;
    private String status;
    private String location;
    private boolean isActive;
    private int currentOrderId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public RestaurantTable() {}

    public RestaurantTable(int tableId, String tableNumber, int capacity) {
        this.tableId = tableId;
        this.tableNumber = tableNumber;
        this.capacity = capacity;
    }

    // Getters and Setters
    public int getTableId() {
        return tableId;
    }

    public void setTableId(int tableId) {
        this.tableId = tableId;
    }

    public String getTableNumber() {
        return tableNumber;
    }

    public void setTableNumber(String tableNumber) {
        this.tableNumber = tableNumber;
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

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public int getCurrentOrderId() {
        return currentOrderId;
    }

    public void setCurrentOrderId(int currentOrderId) {
        this.currentOrderId = currentOrderId;
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
    public boolean isAvailable() {
        return "available".equalsIgnoreCase(status) && isActive;
    }

    public boolean isOccupied() {
        return "occupied".equalsIgnoreCase(status);
    }

    public boolean isReserved() {
        return "reserved".equalsIgnoreCase(status);
    }

    @Override
    public String toString() {
        return "Table " + tableNumber + " (Capacity: " + capacity + ")";
    }
}
