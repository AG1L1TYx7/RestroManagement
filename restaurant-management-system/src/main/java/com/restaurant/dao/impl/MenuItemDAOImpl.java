package com.restaurant.dao.impl;

import com.restaurant.dao.MenuItemDAO;
import com.restaurant.models.MenuItem;
import com.restaurant.models.Category;
import com.restaurant.utils.DatabaseConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;

public class MenuItemDAOImpl implements MenuItemDAO {

    private MenuItem mapResultSetToMenuItem(ResultSet rs) throws SQLException {
        MenuItem item = new MenuItem();
        item.setItemId(rs.getInt("item_id"));
        item.setName(rs.getString("name"));
        item.setDescription(rs.getString("description"));
        item.setPrice(rs.getBigDecimal("price"));
        item.setCost(rs.getBigDecimal("cost"));
        item.setAvailable(rs.getBoolean("is_available"));
        item.setFeatured(rs.getBoolean("is_featured"));
        item.setImageUrl(rs.getString("image_url"));
        item.setPreparationTime(rs.getInt("preparation_time"));
        
        // Load category
        int categoryId = rs.getInt("category_id");
        Category category = new Category();
        category.setCategoryId(categoryId);
        try {
            category.setCategoryName(rs.getString("category_name"));
        } catch (SQLException e) {
            // Category name not in query
        }
        item.setCategory(category);
        
        return item;
    }

    @Override
    public MenuItem findById(int itemId) throws SQLException {
        String sql = "SELECT m.*, c.category_name FROM menu_items m " +
                    "LEFT JOIN categories c ON m.category_id = c.category_id " +
                    "WHERE m.item_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, itemId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToMenuItem(rs);
                }
            }
        }
        return null;
    }

    @Override
    public List<MenuItem> findAll() throws SQLException {
        List<MenuItem> items = new ArrayList<>();
        String sql = "SELECT m.*, c.category_name FROM menu_items m " +
                    "LEFT JOIN categories c ON m.category_id = c.category_id " +
                    "ORDER BY m.name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                items.add(mapResultSetToMenuItem(rs));
            }
        }
        return items;
    }

    @Override
    public List<MenuItem> findByCategory(int categoryId) throws SQLException {
        List<MenuItem> items = new ArrayList<>();
        String sql = "SELECT m.*, c.category_name FROM menu_items m " +
                    "LEFT JOIN categories c ON m.category_id = c.category_id " +
                    "WHERE m.category_id = ? ORDER BY m.name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, categoryId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    items.add(mapResultSetToMenuItem(rs));
                }
            }
        }
        return items;
    }

    @Override
    public List<MenuItem> findAvailable() throws SQLException {
        List<MenuItem> items = new ArrayList<>();
        String sql = "SELECT m.*, c.category_name FROM menu_items m " +
                    "LEFT JOIN categories c ON m.category_id = c.category_id " +
                    "WHERE m.is_available = TRUE ORDER BY m.name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                items.add(mapResultSetToMenuItem(rs));
            }
        }
        return items;
    }

    @Override
    public List<MenuItem> findFeatured() throws SQLException {
        List<MenuItem> items = new ArrayList<>();
        String sql = "SELECT m.*, c.category_name FROM menu_items m " +
                    "LEFT JOIN categories c ON m.category_id = c.category_id " +
                    "WHERE m.is_featured = TRUE AND m.is_available = TRUE " +
                    "ORDER BY m.name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            while (rs.next()) {
                items.add(mapResultSetToMenuItem(rs));
            }
        }
        return items;
    }

    @Override
    public List<MenuItem> search(String keyword) throws SQLException {
        List<MenuItem> items = new ArrayList<>();
        String sql = "SELECT m.*, c.category_name FROM menu_items m " +
                    "LEFT JOIN categories c ON m.category_id = c.category_id " +
                    "WHERE m.name LIKE ? OR m.description LIKE ? " +
                    "ORDER BY m.name";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            String searchPattern = "%" + keyword + "%";
            stmt.setString(1, searchPattern);
            stmt.setString(2, searchPattern);
            
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    items.add(mapResultSetToMenuItem(rs));
                }
            }
        }
        return items;
    }

    @Override
    public int insert(MenuItem item) throws SQLException {
        String sql = "INSERT INTO menu_items (name, description, price, cost, category_id, " +
                    "is_available, is_featured, image_url, preparation_time) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setString(1, item.getName());
            stmt.setString(2, item.getDescription());
            stmt.setBigDecimal(3, item.getPrice());
            stmt.setBigDecimal(4, item.getCost());
            stmt.setInt(5, item.getCategory().getCategoryId());
            stmt.setBoolean(6, item.isAvailable());
            stmt.setBoolean(7, item.isFeatured());
            stmt.setString(8, item.getImageUrl());
            stmt.setInt(9, item.getPreparationTime());
            
            int affectedRows = stmt.executeUpdate();
            
            if (affectedRows > 0) {
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        return generatedKeys.getInt(1);
                    }
                }
            }
        }
        return 0;
    }

    @Override
    public boolean update(MenuItem item) throws SQLException {
        String sql = "UPDATE menu_items SET name = ?, description = ?, price = ?, cost = ?, " +
                    "category_id = ?, is_available = ?, is_featured = ?, image_url = ?, " +
                    "preparation_time = ? WHERE item_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setString(1, item.getName());
            stmt.setString(2, item.getDescription());
            stmt.setBigDecimal(3, item.getPrice());
            stmt.setBigDecimal(4, item.getCost());
            stmt.setInt(5, item.getCategory().getCategoryId());
            stmt.setBoolean(6, item.isAvailable());
            stmt.setBoolean(7, item.isFeatured());
            stmt.setString(8, item.getImageUrl());
            stmt.setInt(9, item.getPreparationTime());
            stmt.setInt(10, item.getItemId());
            
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean updateAvailability(int itemId, boolean available) throws SQLException {
        String sql = "UPDATE menu_items SET is_available = ? WHERE item_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setBoolean(1, available);
            stmt.setInt(2, itemId);
            
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public boolean delete(int itemId) throws SQLException {
        String sql = "DELETE FROM menu_items WHERE item_id = ?";
        
        try (Connection conn = DatabaseConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            
            stmt.setInt(1, itemId);
            return stmt.executeUpdate() > 0;
        }
    }

    @Override
    public int count() throws SQLException {
        String sql = "SELECT COUNT(*) as total FROM menu_items";
        
        try (Connection conn = DatabaseConnection.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            
            if (rs.next()) {
                return rs.getInt("total");
            }
        }
        return 0;
    }
}
