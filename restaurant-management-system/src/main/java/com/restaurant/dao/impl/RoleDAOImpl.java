package com.restaurant.dao.impl;

import com.restaurant.dao.RoleDAO;
import com.restaurant.models.Role;
import com.restaurant.utils.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class RoleDAOImpl implements RoleDAO {

    private Role mapResultSetToRole(ResultSet rs) throws SQLException {
        Role role = new Role();
        role.setRoleId(rs.getInt("role_id"));
        role.setRoleName(rs.getString("role_name"));
        role.setDescription(rs.getString("description"));
        
        // Parse JSON array for permissions
        String permissionsStr = rs.getString("permissions");
        if (permissionsStr != null && !permissionsStr.trim().isEmpty()) {
            List<String> permissions = new ArrayList<>();
            // Remove brackets and quotes, then split
            permissionsStr = permissionsStr.replaceAll("[\\[\\]\"]", "");
            if (!permissionsStr.trim().isEmpty()) {
                permissions = Arrays.asList(permissionsStr.split("\\s*,\\s*"));
            }
            role.setPermissions(permissions);
        }
        
        return role;
    }

    @Override
    public Role findById(int roleId) throws SQLException {
        String sql = "SELECT * FROM roles WHERE role_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, roleId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToRole(rs);
                }
            }
        }
        return null;
    }

    @Override
    public Role findByName(String roleName) throws SQLException {
        String sql = "SELECT * FROM roles WHERE role_name = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, roleName);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToRole(rs);
                }
            }
        }
        return null;
    }

    @Override
    public List<Role> findAll() throws SQLException {
        List<Role> roles = new ArrayList<>();
        String sql = "SELECT * FROM roles ORDER BY role_name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                roles.add(mapResultSetToRole(rs));
            }
        }
        return roles;
    }

    @Override
    public int insert(Role role) throws SQLException {
        String sql = "INSERT INTO roles (role_name, description, permissions) VALUES (?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, role.getRoleName());
            stmt.setString(2, role.getDescription());
            
            // Convert to JSON array format
            String permissionsJson = "[\"" + String.join("\", \"", role.getPermissions()) + "\"]";
            stmt.setString(3, permissionsJson);
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                ResultSet generatedKeys = stmt.getGeneratedKeys();
                if (generatedKeys.next()) {
                    return generatedKeys.getInt(1);
                }
            }
        }
        return 0;
    }

    @Override
    public boolean update(Role role) throws SQLException {
        String sql = "UPDATE roles SET role_name = ?, description = ?, permissions = ? WHERE role_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, role.getRoleName());
            stmt.setString(2, role.getDescription());
            
            // Convert to JSON array format
            String permissionsJson = "[\"" + String.join("\", \"", role.getPermissions()) + "\"]";
            stmt.setString(3, permissionsJson);
            stmt.setInt(4, role.getRoleId());
            
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean delete(int roleId) throws SQLException {
        String sql = "DELETE FROM roles WHERE role_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, roleId);
            return stmt.executeUpdate() > 0;
        }
    }
}
