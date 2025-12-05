package com.restaurant.dao;

import com.restaurant.models.Order;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderDAO {
    Order findById(int orderId) throws SQLException;
    Order findByOrderNumber(String orderNumber) throws SQLException;
    List<Order> findAll() throws SQLException;
    List<Order> findByBranch(int branchId) throws SQLException;
    List<Order> findByStatus(String status) throws SQLException;
    List<Order> findByDateRange(LocalDateTime start, LocalDateTime end) throws SQLException;
    List<Order> findByCustomer(int customerId) throws SQLException;
    List<Order> findByTable(int tableId) throws SQLException;
    List<Order> findTodaysOrders(int branchId) throws SQLException;
    int insert(Order order) throws SQLException;
    boolean update(Order order) throws SQLException;
    boolean updateStatus(int orderId, String status) throws SQLException;
    boolean delete(int orderId) throws SQLException;
    String generateOrderNumber() throws SQLException;
    int count() throws SQLException;
}
