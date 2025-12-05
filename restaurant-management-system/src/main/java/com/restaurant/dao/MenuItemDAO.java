package com.restaurant.dao;

import com.restaurant.models.MenuItem;
import java.sql.SQLException;
import java.util.List;

public interface MenuItemDAO {
    MenuItem findById(int itemId) throws SQLException;
    List<MenuItem> findAll() throws SQLException;
    List<MenuItem> findByCategory(int categoryId) throws SQLException;
    List<MenuItem> findAvailable() throws SQLException;
    List<MenuItem> findFeatured() throws SQLException;
    List<MenuItem> search(String keyword) throws SQLException;
    int insert(MenuItem menuItem) throws SQLException;
    boolean update(MenuItem menuItem) throws SQLException;
    boolean updateAvailability(int itemId, boolean available) throws SQLException;
    boolean delete(int itemId) throws SQLException;
    int count() throws SQLException;
}
