package com.restaurant.services;

import com.restaurant.dao.UserDAO;
import com.restaurant.dao.impl.UserDAOImpl;
import com.restaurant.models.User;
import com.restaurant.utils.PasswordUtil;
import com.restaurant.utils.JWTUtil;
import com.restaurant.config.SessionManager;

import java.sql.SQLException;

public class AuthService {
    private UserDAO userDAO;
    private SessionManager sessionManager;

    public AuthService() {
        this.userDAO = new UserDAOImpl();
        this.sessionManager = SessionManager.getInstance();
    }

    public User authenticate(String username, String password) throws SQLException {
        // Find user by username
        User user = userDAO.findByUsername(username);
        
        if (user == null) {
            throw new SQLException("Invalid username or password");
        }
        
        // Check if user is active
        if (!"active".equalsIgnoreCase(user.getStatus())) {
            throw new SQLException("User account is not active");
        }
        
        // Verify password
        if (!PasswordUtil.verifyPassword(password, user.getPasswordHash())) {
            throw new SQLException("Invalid username or password");
        }
        
        // Generate JWT token
        String token = JWTUtil.generateToken(user);
        user.setToken(token);
        
        // Update last login
        userDAO.updateLastLogin(user.getUserId());
        
        // Set session
        sessionManager.login(user, token);
        
        return user;
    }

    public void logout() {
        sessionManager.logout();
    }

    public boolean isLoggedIn() {
        return sessionManager.isLoggedIn();
    }

    public User getCurrentUser() {
        return sessionManager.getCurrentUser();
    }

    public boolean hasPermission(String permission) {
        return sessionManager.hasPermission(permission);
    }

    public boolean register(User user, String password) throws SQLException {
        // Validate username
        if (userDAO.usernameExists(user.getUsername())) {
            throw new SQLException("Username already exists");
        }
        
        // Validate email
        if (userDAO.emailExists(user.getEmail())) {
            throw new SQLException("Email already exists");
        }
        
        // Hash password
        String hashedPassword = PasswordUtil.hashPassword(password);
        user.setPasswordHash(hashedPassword);
        user.setStatus("active");
        
        // Insert user
        int userId = userDAO.insert(user);
        
        if (userId > 0) {
            user.setUserId(userId);
            return true;
        }
        
        return false;
    }

    public boolean changePassword(int userId, String oldPassword, String newPassword) throws SQLException {
        User user = userDAO.findById(userId);
        
        if (user == null) {
            throw new SQLException("User not found");
        }
        
        // Verify old password
        if (!PasswordUtil.verifyPassword(oldPassword, user.getPasswordHash())) {
            throw new SQLException("Current password is incorrect");
        }
        
        // Hash new password
        String newHashedPassword = PasswordUtil.hashPassword(newPassword);
        
        // Update password
        return userDAO.updatePassword(userId, newHashedPassword);
    }
}
