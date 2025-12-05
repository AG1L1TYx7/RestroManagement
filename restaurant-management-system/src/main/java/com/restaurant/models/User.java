package com.restaurant.models;

import java.time.LocalDateTime;

/**
 * User Model Class
 * Represents a user in the restaurant management system
 */
public class User {
    private int userId;
    private String username;
    private String email;
    private String passwordHash;
    private String fullName;
    private String phone;
    private Role role;
    private Branch branch;
    private String status; // active, inactive, suspended
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String token; // JWT token for session management
    
    // Constructors
    public User() {
    }
    
    public User(String username, String email, String passwordHash, String fullName) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.status = "active";
    }
    
    // Getters and Setters
    public int getUserId() {
        return userId;
    }
    
    public void setUserId(int userId) {
        this.userId = userId;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public Role getRole() {
        return role;
    }
    
    public void setRole(Role role) {
        this.role = role;
    }
    
    public Branch getBranch() {
        return branch;
    }
    
    public void setBranch(Branch branch) {
        this.branch = branch;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getLastLogin() {
        return lastLogin;
    }
    
    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
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
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public int getBranchId() {
        return branch != null ? branch.getBranchId() : 0;
    }
    
    public void setBranchId(int branchId) {
        // This will be set through setBranch() typically
    }
    
    // Helper methods
    public boolean isActive() {
        return "active".equals(this.status);
    }
    
    public boolean hasRole(String roleName) {
        return role != null && role.getRoleName().equalsIgnoreCase(roleName);
    }
    
    public boolean hasPermission(String permission) {
        if (role == null) return false;
        return role.hasPermission(permission);
    }
    
    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", username='" + username + '\'' +
                ", fullName='" + fullName + '\'' +
                ", role=" + (role != null ? role.getRoleName() : "none") +
                ", status='" + status + '\'' +
                '}';
    }
}
