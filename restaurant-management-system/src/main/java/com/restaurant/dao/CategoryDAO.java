package com.restaurant.dao;

import com.restaurant.models.Category;
import java.sql.SQLException;
import java.util.List;

public interface CategoryDAO {
    Category findById(int categoryId) throws SQLException;
    Category findByName(String categoryName) throws SQLException;
    List<Category> findAll() throws SQLException;
    List<Category> findActive() throws SQLException;
    int insert(Category category) throws SQLException;
    boolean update(Category category) throws SQLException;
    boolean delete(int categoryId) throws SQLException;
}
