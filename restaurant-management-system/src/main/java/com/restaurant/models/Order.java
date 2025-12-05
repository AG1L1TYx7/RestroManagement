package com.restaurant.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Order {
    private int orderId;
    private String orderNumber;
    private int customerId;
    private Customer customer;
    private int tableId;
    private RestaurantTable table;
    private int userId;
    private User user;
    private int branchId;
    private Branch branch;
    private String orderType;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String specialInstructions;
    private LocalDateTime orderTime;
    private LocalDateTime completedTime;
    private List<OrderDetail> orderDetails;

    // Constructors
    public Order() {
        this.orderDetails = new ArrayList<>();
    }

    public Order(int orderId, String orderNumber) {
        this();
        this.orderId = orderId;
        this.orderNumber = orderNumber;
    }

    // Getters and Setters
    public int getOrderId() {
        return orderId;
    }

    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public int getCustomerId() {
        return customerId;
    }

    public void setCustomerId(int customerId) {
        this.customerId = customerId;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
        if (customer != null) {
            this.customerId = customer.getCustomerId();
        }
    }

    public int getTableId() {
        return tableId;
    }

    public void setTableId(int tableId) {
        this.tableId = tableId;
    }

    public RestaurantTable getTable() {
        return table;
    }

    public void setTable(RestaurantTable table) {
        this.table = table;
        if (table != null) {
            this.tableId = table.getTableId();
        }
    }

    public int getUserId() {
        return userId;
    }

    public void setUserId(int userId) {
        this.userId = userId;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        if (user != null) {
            this.userId = user.getUserId();
        }
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

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    public LocalDateTime getOrderTime() {
        return orderTime;
    }

    public void setOrderTime(LocalDateTime orderTime) {
        this.orderTime = orderTime;
    }

    public LocalDateTime getCompletedTime() {
        return completedTime;
    }

    public void setCompletedTime(LocalDateTime completedTime) {
        this.completedTime = completedTime;
    }

    public List<OrderDetail> getOrderDetails() {
        return orderDetails;
    }

    public void setOrderDetails(List<OrderDetail> orderDetails) {
        this.orderDetails = orderDetails;
    }

    // Business methods
    public void addOrderDetail(OrderDetail detail) {
        this.orderDetails.add(detail);
        recalculateTotals();
    }

    public void removeOrderDetail(OrderDetail detail) {
        this.orderDetails.remove(detail);
        recalculateTotals();
    }

    public void recalculateTotals() {
        subtotal = orderDetails.stream()
            .map(OrderDetail::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (taxAmount == null) {
            taxAmount = subtotal.multiply(new BigDecimal("0.08"));
        }
        
        if (discountAmount == null) {
            discountAmount = BigDecimal.ZERO;
        }
        
        totalAmount = subtotal.add(taxAmount).subtract(discountAmount);
    }

    public boolean isPending() {
        return "pending".equalsIgnoreCase(status);
    }

    public boolean isCompleted() {
        return "completed".equalsIgnoreCase(status);
    }

    public boolean isCancelled() {
        return "cancelled".equalsIgnoreCase(status);
    }

    @Override
    public String toString() {
        return orderNumber + " - $" + totalAmount;
    }
}
