package com.restaurant.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class PurchaseOrder {
    private int poId;
    private String poNumber;
    private int supplierId;
    private Supplier supplier;
    private int branchId;
    private Branch branch;
    private int orderedBy;
    private User orderedByUser;
    private String status;
    private LocalDateTime orderDate;
    private LocalDateTime expectedDeliveryDate;
    private LocalDateTime actualDeliveryDate;
    private BigDecimal totalAmount;
    private String notes;
    private List<PODetail> poDetails;

    // Constructors
    public PurchaseOrder() {
        this.poDetails = new ArrayList<>();
    }

    public PurchaseOrder(int poId, String poNumber) {
        this();
        this.poId = poId;
        this.poNumber = poNumber;
    }

    // Getters and Setters
    public int getPoId() {
        return poId;
    }

    public void setPoId(int poId) {
        this.poId = poId;
    }

    public String getPoNumber() {
        return poNumber;
    }

    public void setPoNumber(String poNumber) {
        this.poNumber = poNumber;
    }

    public int getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(int supplierId) {
        this.supplierId = supplierId;
    }

    public Supplier getSupplier() {
        return supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
        if (supplier != null) {
            this.supplierId = supplier.getSupplierId();
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

    public int getOrderedBy() {
        return orderedBy;
    }

    public void setOrderedBy(int orderedBy) {
        this.orderedBy = orderedBy;
    }

    public User getOrderedByUser() {
        return orderedByUser;
    }

    public void setOrderedByUser(User orderedByUser) {
        this.orderedByUser = orderedByUser;
        if (orderedByUser != null) {
            this.orderedBy = orderedByUser.getUserId();
        }
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public LocalDateTime getExpectedDeliveryDate() {
        return expectedDeliveryDate;
    }

    public void setExpectedDeliveryDate(LocalDateTime expectedDeliveryDate) {
        this.expectedDeliveryDate = expectedDeliveryDate;
    }

    public LocalDateTime getActualDeliveryDate() {
        return actualDeliveryDate;
    }

    public void setActualDeliveryDate(LocalDateTime actualDeliveryDate) {
        this.actualDeliveryDate = actualDeliveryDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<PODetail> getPoDetails() {
        return poDetails;
    }

    public void setPoDetails(List<PODetail> poDetails) {
        this.poDetails = poDetails;
    }

    // Business methods
    public void addPODetail(PODetail detail) {
        this.poDetails.add(detail);
        recalculateTotal();
    }

    public void removePODetail(PODetail detail) {
        this.poDetails.remove(detail);
        recalculateTotal();
    }

    public void recalculateTotal() {
        totalAmount = poDetails.stream()
            .map(PODetail::getSubtotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public boolean isPending() {
        return "pending".equalsIgnoreCase(status);
    }

    public boolean isReceived() {
        return "received".equalsIgnoreCase(status);
    }

    public boolean isCancelled() {
        return "cancelled".equalsIgnoreCase(status);
    }

    public boolean isOverdue() {
        if (expectedDeliveryDate == null || isReceived() || isCancelled()) {
            return false;
        }
        return LocalDateTime.now().isAfter(expectedDeliveryDate);
    }

    @Override
    public String toString() {
        return poNumber + " - " + (supplier != null ? supplier.getSupplierName() : "Supplier #" + supplierId);
    }
}
