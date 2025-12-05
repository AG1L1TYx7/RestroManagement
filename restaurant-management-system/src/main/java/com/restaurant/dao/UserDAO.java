package com.restaurant.dao;

import com.restaurant.models.User;
import java.sql.SQLException;
import java.util.List;

public interface UserDAO {
    User findById(int userId) throws SQLException;
    User findByUsername(String username) throws SQLException;
    User findByEmail(String email) throws SQLException;
    List<User> findAll() throws SQLException;
    List<User> findByRole(int roleId) throws SQLException;
    List<User> findByBranch(int branchId) throws SQLException;
    List<User> findByStatus(String status) throws SQLException;
    int insert(User user) throws SQLException;
    boolean update(User user) throws SQLException;
    boolean updatePassword(int userId, String newPasswordHash) throws SQLException;
    boolean updateLastLogin(int userId) throws SQLException;
    boolean delete(int userId) throws SQLException;
    boolean usernameExists(String username) throws SQLException;
    boolean emailExists(String email) throws SQLException;
    int count() throws SQLException;
}
