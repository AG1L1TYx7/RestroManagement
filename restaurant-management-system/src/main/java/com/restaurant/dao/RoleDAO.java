package com.restaurant.dao;

import com.restaurant.models.Role;
import java.sql.SQLException;
import java.util.List;

public interface RoleDAO {
    Role findById(int roleId) throws SQLException;
    Role findByName(String roleName) throws SQLException;
    List<Role> findAll() throws SQLException;
    int insert(Role role) throws SQLException;
    boolean update(Role role) throws SQLException;
    boolean delete(int roleId) throws SQLException;
}
