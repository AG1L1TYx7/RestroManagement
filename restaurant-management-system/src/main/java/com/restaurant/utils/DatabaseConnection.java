package com.restaurant.utils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

/**
 * Database Connection Manager
 * Manages MySQL database connections using connection pooling
 */
public class DatabaseConnection {
    private static Connection connection = null;
    private static Properties properties = new Properties();
    
    static {
        try {
            // Load database configuration from classpath
            ClassLoader classLoader = DatabaseConnection.class.getClassLoader();
            properties.load(classLoader.getResourceAsStream("config.properties"));
            
            // Load MySQL JDBC Driver
            Class.forName(properties.getProperty("db.driver"));
            System.out.println("MySQL JDBC Driver loaded successfully");
        } catch (ClassNotFoundException e) {
            System.err.println("MySQL JDBC Driver not found!");
            e.printStackTrace();
        } catch (IOException e) {
            System.err.println("Error loading configuration file!");
            e.printStackTrace();
        } catch (NullPointerException e) {
            System.err.println("Configuration file not found in classpath!");
            e.printStackTrace();
        }
    }
    
    /**
     * Get database connection
     * @return Connection object
     */
    public static Connection getConnection() {
        try {
            if (connection == null || connection.isClosed()) {
                String url = properties.getProperty("db.url");
                String user = properties.getProperty("db.user");
                String password = properties.getProperty("db.password");
                
                connection = DriverManager.getConnection(url, user, password);
                System.out.println("Database connection established successfully");
            }
        } catch (SQLException e) {
            System.err.println("Error establishing database connection!");
            e.printStackTrace();
        }
        return connection;
    }
    
    /**
     * Close database connection
     */
    public static void closeConnection() {
        try {
            if (connection != null && !connection.isClosed()) {
                connection.close();
                System.out.println("Database connection closed");
            }
        } catch (SQLException e) {
            System.err.println("Error closing database connection!");
            e.printStackTrace();
        }
    }
    
    /**
     * Test database connection
     * @return true if connection successful, false otherwise
     */
    public static boolean testConnection() {
        try {
            Connection conn = getConnection();
            return conn != null && !conn.isClosed();
        } catch (SQLException e) {
            return false;
        }
    }
    
    /**
     * Get database URL from properties
     */
    public static String getDatabaseUrl() {
        return properties.getProperty("db.url");
    }
    
    /**
     * Get database user from properties
     */
    public static String getDatabaseUser() {
        return properties.getProperty("db.user");
    }
}
