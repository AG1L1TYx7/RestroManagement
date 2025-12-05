package com.restaurant.utils;

import org.mindrot.jbcrypt.BCrypt;

/**
 * Password Utility for hashing and verifying passwords using BCrypt
 */
public class PasswordUtil {
    
    // BCrypt rounds (strength factor: 10 is recommended for good security/performance balance)
    private static final int BCRYPT_ROUNDS = 10;
    
    /**
     * Hash a plain text password using BCrypt
     * @param plainPassword The plain text password
     * @return The hashed password
     */
    public static String hashPassword(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(BCRYPT_ROUNDS));
    }
    
    /**
     * Verify a plain text password against a hashed password
     * @param plainPassword The plain text password to verify
     * @param hashedPassword The hashed password to check against
     * @return true if password matches, false otherwise
     */
    public static boolean verifyPassword(String plainPassword, String hashedPassword) {
        try {
            return BCrypt.checkpw(plainPassword, hashedPassword);
        } catch (Exception e) {
            System.err.println("Error verifying password: " + e.getMessage());
            return false;
        }
    }
    
    /**
     * Validate password strength
     * @param password The password to validate
     * @return true if password meets requirements, false otherwise
     */
    public static boolean validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        
        // Require at least 3 out of 4 character types
        int typeCount = (hasUpper ? 1 : 0) + (hasLower ? 1 : 0) + 
                        (hasDigit ? 1 : 0) + (hasSpecial ? 1 : 0);
        
        return typeCount >= 3;
    }
    
    /**
     * Get password strength description
     * @param password The password to evaluate
     * @return Strength description (Weak, Medium, Strong)
     */
    public static String getPasswordStrength(String password) {
        if (password == null || password.length() < 6) {
            return "Weak";
        }
        
        if (password.length() < 8) {
            return "Medium";
        }
        
        if (validatePasswordStrength(password)) {
            return "Strong";
        }
        
        return "Medium";
    }
}
