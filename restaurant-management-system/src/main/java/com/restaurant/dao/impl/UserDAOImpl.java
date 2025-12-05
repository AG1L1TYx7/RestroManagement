package com.restaurant.dao.impl;

import com.restaurant.dao.UserDAO;
import com.restaurant.dao.RoleDAO;
import com.restaurant.models.User;
import com.restaurant.models.Role;
import com.restaurant.models.Branch;
import com.restaurant.utils.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAOImpl implements UserDAO {
    private RoleDAO roleDAO;

    public UserDAOImpl() {
        this.roleDAO = new RoleDAOImpl();
    }

    private User mapResultSetToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setUserId(rs.getInt("user_id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setFullName(rs.getString("full_name"));
        user.setPhone(rs.getString("phone"));
        user.setStatus(rs.getString("status"));
        
        Timestamp lastLogin = rs.getTimestamp("last_login");
        if (lastLogin != null) {
            user.setLastLogin(lastLogin.toLocalDateTime());
        }
        
        user.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        user.setUpdatedAt(rs.getTimestamp("updated_at").toLocalDateTime());
        
        // Load role
        int roleId = rs.getInt("role_id");
        try {
            Role role = roleDAO.findById(roleId);
            user.setRole(role);
        } catch (SQLException e) {
            System.err.println("Error loading role: " + e.getMessage());
        }
        
        // Create branch object if branch data exists
        int branchId = rs.getInt("branch_id");
        if (!rs.wasNull()) {
            Branch branch = new Branch();
            branch.setBranchId(branchId);
            try {
                branch.setBranchName(rs.getString("branch_name"));
            } catch (SQLException e) {
                // Branch name not in query
            }
            user.setBranch(branch);
        }
        
        return user;
    }

    @Override
    public User findById(int userId) throws SQLException {
        String sql = "SELECT u.*, b.branch_name FROM users u " +
                    "LEFT JOIN branches b ON u.branch_id = b.branch_id " +
                    "WHERE u.user_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        }
        return null;
    }

    @Override
    public User findByUsername(String username) throws SQLException {
        String sql = "SELECT u.*, b.branch_name FROM users u " +
                    "LEFT JOIN branches b ON u.branch_id = b.branch_id " +
                    "WHERE u.username = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, username);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        }
        return null;
    }

    @Override
    public User findByEmail(String email) throws SQLException {
        String sql = "SELECT u.*, b.branch_name FROM users u " +
                    "LEFT JOIN branches b ON u.branch_id = b.branch_id " +
                    "WHERE u.email = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToUser(rs);
                }
            }
        }
        return null;
    }

    @Override
    public List<User> findAll() throws SQLException {
        List<User> users = new ArrayList<>();
        String sql = "SELECT u.*, b.branch_name FROM users u " +
                    "LEFT JOIN branches b ON u.branch_id = b.branch_id " +
                    "ORDER BY u.created_at DESC";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                users.add(mapResultSetToUser(rs));
            }
        }
        return users;
    }

    @Override
    public List<User> findByRole(int roleId) throws SQLException {
        List<User> users = new ArrayList<>();
        String sql = "SELECT u.*, b.branch_name FROM users u " +
                    "LEFT JOIN branches b ON u.branch_id = b.branch_id " +
                    "WHERE u.role_id = ? ORDER BY u.full_name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, roleId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    users.add(mapResultSetToUser(rs));
                }
            }
        }
        return users;
    }

    @Override
    public List<User> findByBranch(int branchId) throws SQLException {
        List<User> users = new ArrayList<>();
        String sql = "SELECT u.*, b.branch_name FROM users u " +
                    "LEFT JOIN branches b ON u.branch_id = b.branch_id " +
                    "WHERE u.branch_id = ? ORDER BY u.full_name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, branchId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    users.add(mapResultSetToUser(rs));
                }
            }
        }
        return users;
    }

    @Override
    public List<User> findByStatus(String status) throws SQLException {
        List<User> users = new ArrayList<>();
        String sql = "SELECT u.*, b.branch_name FROM users u " +
                    "LEFT JOIN branches b ON u.branch_id = b.branch_id " +
                    "WHERE u.status = ? ORDER BY u.full_name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, status);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    users.add(mapResultSetToUser(rs));
                }
            }
        }
        return users;
    }

    @Override
    public int insert(User user) throws SQLException {
        String sql = "INSERT INTO users (username, email, password_hash, full_name, phone, " +
                    "role_id, branch_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getPasswordHash());
            stmt.setString(4, user.getFullName());
            stmt.setString(5, user.getPhone());
            stmt.setInt(6, user.getRole().getRoleId());
            
            if (user.getBranch() != null) {
                stmt.setInt(7, user.getBranch().getBranchId());
            } else {
                stmt.setNull(7, Types.INTEGER);
            }
            
            stmt.setString(8, user.getStatus() != null ? user.getStatus() : "active");
            
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
    public boolean update(User user) throws SQLException {
        String sql = "UPDATE users SET username = ?, email = ?, full_name = ?, phone = ?, " +
                    "role_id = ?, branch_id = ?, status = ? WHERE user_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getEmail());
            stmt.setString(3, user.getFullName());
            stmt.setString(4, user.getPhone());
            stmt.setInt(5, user.getRole().getRoleId());
            
            if (user.getBranch() != null) {
                stmt.setInt(6, user.getBranch().getBranchId());
            } else {
                stmt.setNull(6, Types.INTEGER);
            }
            
            stmt.setString(7, user.getStatus());
            stmt.setInt(8, user.getUserId());
            
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean updatePassword(int userId, String newPasswordHash) throws SQLException {
        String sql = "UPDATE users SET password_hash = ? WHERE user_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, newPasswordHash);
            stmt.setInt(2, userId);
            
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean updateLastLogin(int userId) throws SQLException {
        String sql = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean delete(int userId) throws SQLException {
        String sql = "DELETE FROM users WHERE user_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, userId);
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean usernameExists(String username) throws SQLException {
        String sql = "SELECT COUNT(*) FROM users WHERE username = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, username);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        }
        return false;
    }

    @Override
    public boolean emailExists(String email) throws SQLException {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, email);
            ResultSet rs = stmt.executeQuery();
            
            if (rs.next()) {
                return rs.getInt(1) > 0;
            }
        }
        return false;
    }

    @Override
    public int count() throws SQLException {
        String sql = "SELECT COUNT(*) FROM users";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            if (rs.next()) {
                return rs.getInt(1);
            }
        }
        return 0;
    }
}
