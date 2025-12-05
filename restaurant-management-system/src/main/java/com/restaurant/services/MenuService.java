package com.restaurant.services;

import com.restaurant.dao.MenuItemDAO;
import com.restaurant.dao.CategoryDAO;
import com.restaurant.dao.impl.MenuItemDAOImpl;
import com.restaurant.dao.impl.CategoryDAOImpl;
import com.restaurant.models.MenuItem;
import com.restaurant.models.Category;

import java.sql.SQLException;
import java.util.List;

public class MenuService {
    private MenuItemDAO menuItemDAO;
    private CategoryDAO categoryDAO;
    
    public MenuService() {
        this.menuItemDAO = new MenuItemDAOImpl();
        this.categoryDAO = new CategoryDAOImpl();
    }
    
    // MenuItem operations
    public MenuItem getMenuItemById(int itemId) throws SQLException {
        return menuItemDAO.findById(itemId);
    }
    
    public List<MenuItem> getAllMenuItems() throws SQLException {
        return menuItemDAO.findAll();
    }
    
    public List<MenuItem> getMenuItemsByCategory(int categoryId) throws SQLException {
        return menuItemDAO.findByCategory(categoryId);
    }
    
    public List<MenuItem> getAvailableMenuItems() throws SQLException {
        return menuItemDAO.findAvailable();
    }
    
    public List<MenuItem> getFeaturedMenuItems() throws SQLException {
        return menuItemDAO.findFeatured();
    }
    
    public List<MenuItem> searchMenuItems(String keyword) throws SQLException {
        return menuItemDAO.search(keyword);
    }
    
    public int createMenuItem(MenuItem item) throws SQLException {
        validateMenuItem(item);
        return menuItemDAO.insert(item);
    }
    
    public boolean updateMenuItem(MenuItem item) throws SQLException {
        validateMenuItem(item);
        return menuItemDAO.update(item);
    }
    
    public boolean toggleMenuItemAvailability(int itemId) throws SQLException {
        MenuItem item = menuItemDAO.findById(itemId);
        if (item != null) {
            return menuItemDAO.updateAvailability(itemId, !item.isAvailable());
        }
        return false;
    }
    
    public boolean deleteMenuItem(int itemId) throws SQLException {
        return menuItemDAO.delete(itemId);
    }
    
    public int getMenuItemCount() throws SQLException {
        return menuItemDAO.count();
    }
    
    // Category operations
    public Category getCategoryById(int categoryId) throws SQLException {
        return categoryDAO.findById(categoryId);
    }
    
    public List<Category> getAllCategories() throws SQLException {
        return categoryDAO.findAll();
    }
    
    public List<Category> getActiveCategories() throws SQLException {
        return categoryDAO.findActive();
    }
    
    public int createCategory(Category category) throws SQLException {
        validateCategory(category);
        return categoryDAO.insert(category);
    }
    
    public boolean updateCategory(Category category) throws SQLException {
        validateCategory(category);
        return categoryDAO.update(category);
    }
    
    public boolean deleteCategory(int categoryId) throws SQLException {
        return categoryDAO.delete(categoryId);
    }
    
    // Validation methods
    private void validateMenuItem(MenuItem item) throws IllegalArgumentException {
        if (item.getName() == null || item.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Menu item name is required");
        }
        
        if (item.getPrice() == null || item.getPrice().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Menu item price must be greater than zero");
        }
        
        if (item.getCategory() == null || item.getCategory().getCategoryId() == 0) {
            throw new IllegalArgumentException("Menu item category is required");
        }
    }
    
    private void validateCategory(Category category) throws IllegalArgumentException {
        if (category.getCategoryName() == null || category.getCategoryName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name is required");
        }
    }
}
