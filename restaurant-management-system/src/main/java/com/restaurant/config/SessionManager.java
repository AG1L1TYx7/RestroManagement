package com.restaurant.config;

import com.restaurant.models.User;
import java.time.LocalDateTime;

public class SessionManager {
    private static SessionManager instance;
    private User currentUser;
    private String jwtToken;
    private LocalDateTime loginTime;
    private LocalDateTime lastActivityTime;

    private SessionManager() {}

    public static SessionManager getInstance() {
        if (instance == null) {
            instance = new SessionManager();
        }
        return instance;
    }

    public void login(User user, String token) {
        this.currentUser = user;
        this.jwtToken = token;
        this.loginTime = LocalDateTime.now();
        this.lastActivityTime = LocalDateTime.now();
    }

    public void logout() {
        this.currentUser = null;
        this.jwtToken = null;
        this.loginTime = null;
        this.lastActivityTime = null;
    }

    public boolean isLoggedIn() {
        return currentUser != null;
    }

    public User getCurrentUser() {
        updateLastActivity();
        return currentUser;
    }

    public String getJwtToken() {
        return jwtToken;
    }

    public void updateLastActivity() {
        this.lastActivityTime = LocalDateTime.now();
    }

    public boolean hasPermission(String permission) {
        if (currentUser == null || currentUser.getRole() == null) {
            return false;
        }
        return currentUser.getRole().hasPermission(permission);
    }

    public boolean hasRole(String roleName) {
        if (currentUser == null || currentUser.getRole() == null) {
            return false;
        }
        return currentUser.getRole().getRoleName().equalsIgnoreCase(roleName);
    }

    public boolean isSessionExpired() {
        if (lastActivityTime == null) return true;
        
        long sessionTimeout = AppConfig.getInstance().getSessionTimeout();
        long millisSinceLastActivity = java.time.Duration.between(lastActivityTime, LocalDateTime.now()).toMillis();
        
        return millisSinceLastActivity > sessionTimeout;
    }

    public LocalDateTime getLoginTime() {
        return loginTime;
    }

    public LocalDateTime getLastActivityTime() {
        return lastActivityTime;
    }
}
