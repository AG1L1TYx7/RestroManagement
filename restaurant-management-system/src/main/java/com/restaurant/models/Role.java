package com.restaurant.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Role Model Class
 * Represents user roles with permissions
 */
public class Role {
    private int roleId;
    private String roleName;
    private String description;
    private List<String> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public Role() {
        this.permissions = new ArrayList<>();
    }
    
    public Role(int roleId, String roleName) {
        this.roleId = roleId;
        this.roleName = roleName;
        this.permissions = new ArrayList<>();
    }
    
    // Getters and Setters
    public int getRoleId() {
        return roleId;
    }
    
    public void setRoleId(int roleId) {
        this.roleId = roleId;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<String> getPermissions() {
        return permissions;
    }
    
    public void setPermissions(List<String> permissions) {
        this.permissions = permissions;
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
    
    // Helper methods
    public boolean hasPermission(String permission) {
        if (permissions == null || permissions.isEmpty()) {
            return false;
        }
        
        // Check for wildcard permission (admin has "*")
        if (permissions.contains("*")) {
            return true;
        }
        
        // Check for exact permission
        if (permissions.contains(permission)) {
            return true;
        }
        
        // Check for wildcard pattern (e.g., "orders.*" matches "orders.create")
        for (String perm : permissions) {
            if (perm.endsWith(".*")) {
                String prefix = perm.substring(0, perm.length() - 2);
                if (permission.startsWith(prefix + ".")) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    public void addPermission(String permission) {
        if (!permissions.contains(permission)) {
            permissions.add(permission);
        }
    }
    
    public void removePermission(String permission) {
        permissions.remove(permission);
    }
    
    @Override
    public String toString() {
        return "Role{" +
                "roleId=" + roleId +
                ", roleName='" + roleName + '\'' +
                ", permissions=" + permissions.size() +
                '}';
    }
}
