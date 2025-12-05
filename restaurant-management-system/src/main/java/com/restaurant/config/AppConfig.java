package com.restaurant.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

public class AppConfig {
    private static AppConfig instance;
    private Properties properties;

    private AppConfig() {
        properties = new Properties();
        loadProperties();
    }

    public static AppConfig getInstance() {
        if (instance == null) {
            instance = new AppConfig();
        }
        return instance;
    }

    private void loadProperties() {
        try {
            // Try loading from resources folder first
            InputStream input = getClass().getClassLoader().getResourceAsStream("config.properties");
            if (input == null) {
                // Try loading from file system
                input = new FileInputStream("src/main/resources/config.properties");
            }
            properties.load(input);
            input.close();
        } catch (IOException e) {
            System.err.println("Error loading configuration: " + e.getMessage());
            loadDefaults();
        }
    }

    private void loadDefaults() {
        // Database defaults
        properties.setProperty("db.url", "jdbc:mysql://localhost:3306/restaurant_db");
        properties.setProperty("db.user", "root");
        properties.setProperty("db.password", "");
        
        // JWT defaults
        properties.setProperty("jwt.secret", "your-secret-key-here-change-in-production");
        properties.setProperty("jwt.expiration", "86400000");
        
        // Session defaults
        properties.setProperty("session.timeout", "1800000");
        
        // Business defaults
        properties.setProperty("tax.rate", "0.08");
        properties.setProperty("currency", "USD");
    }

    public String getProperty(String key) {
        return properties.getProperty(key);
    }

    public String getProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }

    public int getIntProperty(String key, int defaultValue) {
        try {
            return Integer.parseInt(properties.getProperty(key));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public double getDoubleProperty(String key, double defaultValue) {
        try {
            return Double.parseDouble(properties.getProperty(key));
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public boolean getBooleanProperty(String key, boolean defaultValue) {
        String value = properties.getProperty(key);
        if (value == null) return defaultValue;
        return Boolean.parseBoolean(value);
    }

    // Convenience methods
    public String getDbUrl() {
        return getProperty("db.url");
    }

    public String getDbUser() {
        return getProperty("db.user");
    }

    public String getDbPassword() {
        return getProperty("db.password");
    }

    public String getJwtSecret() {
        return getProperty("jwt.secret");
    }

    public long getJwtExpiration() {
        return getIntProperty("jwt.expiration", 86400000);
    }

    public long getSessionTimeout() {
        return getIntProperty("session.timeout", 1800000);
    }

    public double getTaxRate() {
        return getDoubleProperty("tax.rate", 0.08);
    }

    public String getCurrency() {
        return getProperty("currency", "USD");
    }
}
