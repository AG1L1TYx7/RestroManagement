package com.restaurant.utils;

import java.util.regex.Pattern;

public class ValidationUtil {
    
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$"
    );
    
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[0-9]{10}$|^\\+[0-9]{1,3}[0-9]{10}$"
    );
    
    private static final Pattern POSTAL_CODE_PATTERN = Pattern.compile(
        "^[0-9]{5}$|^[0-9]{5}-[0-9]{4}$"
    );

    public static boolean isValidEmail(String email) {
        return email != null && EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidPhone(String phone) {
        if (phone == null) return false;
        String cleaned = phone.replaceAll("[\\s()-]", "");
        return PHONE_PATTERN.matcher(cleaned).matches();
    }

    public static boolean isValidPostalCode(String postalCode) {
        return postalCode != null && POSTAL_CODE_PATTERN.matcher(postalCode).matches();
    }

    public static boolean isNotEmpty(String value) {
        return value != null && !value.trim().isEmpty();
    }

    public static boolean isPositiveNumber(Number number) {
        return number != null && number.doubleValue() > 0;
    }

    public static boolean isNonNegativeNumber(Number number) {
        return number != null && number.doubleValue() >= 0;
    }

    public static boolean isInRange(Number number, double min, double max) {
        if (number == null) return false;
        double value = number.doubleValue();
        return value >= min && value <= max;
    }

    public static boolean isMinLength(String value, int minLength) {
        return value != null && value.length() >= minLength;
    }

    public static boolean isMaxLength(String value, int maxLength) {
        return value != null && value.length() <= maxLength;
    }

    public static boolean isLengthBetween(String value, int minLength, int maxLength) {
        return value != null && value.length() >= minLength && value.length() <= maxLength;
    }

    public static String sanitizeInput(String input) {
        if (input == null) return null;
        return input.trim().replaceAll("[<>\"']", "");
    }

    public static boolean isValidUsername(String username) {
        if (username == null) return false;
        return username.matches("^[a-zA-Z0-9_]{3,20}$");
    }

    public static boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) return false;
        
        boolean hasUpper = false, hasLower = false, hasDigit = false, hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        
        return hasUpper && hasLower && hasDigit;
    }
}
