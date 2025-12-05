package com.restaurant.views;

import com.restaurant.models.User;
import com.restaurant.services.AuthService;
import com.restaurant.utils.DatabaseConnection;

import javax.swing.*;
import java.awt.*;
import java.sql.*;

public class DashboardView extends JPanel {
    private User currentUser;
    private JFrame parentFrame;
    
    // Statistics labels
    private JLabel totalOrdersLabel;
    private JLabel todayRevenueLabel;
    private JLabel activeTablesLabel;
    private JLabel lowStockItemsLabel;
    
    public DashboardView(User user, JFrame parent) {
        this.currentUser = user;
        this.parentFrame = parent;
        
        setLayout(new BorderLayout(10, 10));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        
        // Header panel
        add(createHeaderPanel(), BorderLayout.NORTH);
        
        // Statistics panel
        add(createStatisticsPanel(), BorderLayout.CENTER);
        
        // Quick actions panel
        add(createQuickActionsPanel(), BorderLayout.SOUTH);
        
        // Load initial data
        loadDashboardData();
    }
    
    private JPanel createHeaderPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(0, 0, 20, 0));
        
        JLabel titleLabel = new JLabel("Dashboard");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 24));
        panel.add(titleLabel, BorderLayout.WEST);
        
        JLabel welcomeLabel = new JLabel("Welcome, " + currentUser.getFullName());
        welcomeLabel.setFont(new Font("Arial", Font.PLAIN, 14));
        panel.add(welcomeLabel, BorderLayout.EAST);
        
        return panel;
    }
    
    private JPanel createStatisticsPanel() {
        JPanel panel = new JPanel(new GridLayout(2, 2, 20, 20));
        
        // Total Orders Card
        panel.add(createStatCard("Total Orders Today", "0", Color.decode("#4CAF50"), "📦"));
        
        // Today Revenue Card
        panel.add(createStatCard("Today's Revenue", "$0.00", Color.decode("#2196F3"), "💰"));
        
        // Active Tables Card
        panel.add(createStatCard("Active Tables", "0", Color.decode("#FF9800"), "🪑"));
        
        // Low Stock Items Card
        panel.add(createStatCard("Low Stock Items", "0", Color.decode("#F44336"), "⚠️"));
        
        return panel;
    }
    
    private JPanel createStatCard(String title, String initialValue, Color color, String emoji) {
        JPanel card = new JPanel();
        card.setLayout(new BoxLayout(card, BoxLayout.Y_AXIS));
        card.setBackground(Color.WHITE);
        card.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(color, 2),
            BorderFactory.createEmptyBorder(20, 20, 20, 20)
        ));
        
        JLabel emojiLabel = new JLabel(emoji);
        emojiLabel.setFont(new Font("Arial", Font.PLAIN, 40));
        emojiLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JLabel valueLabel = new JLabel(initialValue);
        valueLabel.setFont(new Font("Arial", Font.BOLD, 32));
        valueLabel.setForeground(color);
        valueLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        JLabel titleLabel = new JLabel(title);
        titleLabel.setFont(new Font("Arial", Font.PLAIN, 14));
        titleLabel.setForeground(Color.GRAY);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        card.add(emojiLabel);
        card.add(Box.createRigidArea(new Dimension(0, 10)));
        card.add(valueLabel);
        card.add(Box.createRigidArea(new Dimension(0, 5)));
        card.add(titleLabel);
        
        // Store reference to value label for updates
        if (title.contains("Orders")) {
            totalOrdersLabel = valueLabel;
        } else if (title.contains("Revenue")) {
            todayRevenueLabel = valueLabel;
        } else if (title.contains("Tables")) {
            activeTablesLabel = valueLabel;
        } else if (title.contains("Stock")) {
            lowStockItemsLabel = valueLabel;
        }
        
        return card;
    }
    
    private JPanel createQuickActionsPanel() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 15, 10));
        panel.setBorder(BorderFactory.createEmptyBorder(20, 0, 0, 0));
        
        // Check permissions before showing buttons
        String roleName = currentUser.getRole().getRoleName().toLowerCase();
        
        if (hasPermission("orders")) {
            JButton newOrderBtn = createActionButton("New Order", "📝");
            newOrderBtn.addActionListener(e -> showMessage("Order Management", "Order management coming soon!"));
            panel.add(newOrderBtn);
        }
        
        if (hasPermission("menu")) {
            JButton menuBtn = createActionButton("Manage Menu", "🍽️");
            menuBtn.addActionListener(e -> showMessage("Menu Management", "Menu management coming soon!"));
            panel.add(menuBtn);
        }
        
        if (hasPermission("inventory")) {
            JButton inventoryBtn = createActionButton("Inventory", "📊");
            inventoryBtn.addActionListener(e -> showMessage("Inventory", "Inventory management coming soon!"));
            panel.add(inventoryBtn);
        }
        
        if (hasPermission("reports")) {
            JButton reportsBtn = createActionButton("Reports", "📈");
            reportsBtn.addActionListener(e -> showMessage("Reports", "Report generation coming soon!"));
            panel.add(reportsBtn);
        }
        
        JButton refreshBtn = createActionButton("Refresh", "🔄");
        refreshBtn.addActionListener(e -> loadDashboardData());
        panel.add(refreshBtn);
        
        return panel;
    }
    
    private JButton createActionButton(String text, String emoji) {
        JButton button = new JButton(emoji + " " + text);
        button.setFont(new Font("Arial", Font.BOLD, 14));
        button.setPreferredSize(new Dimension(150, 40));
        button.setFocusPainted(false);
        return button;
    }
    
    private boolean hasPermission(String permission) {
        String roleName = currentUser.getRole().getRoleName().toLowerCase();
        
        // Admin has all permissions
        if (roleName.equals("admin")) {
            return true;
        }
        
        // Check specific permissions
        for (String perm : currentUser.getRole().getPermissions()) {
            if (perm.equals("*") || perm.startsWith(permission)) {
                return true;
            }
        }
        
        return false;
    }
    
    private void loadDashboardData() {
        // Run in background thread to avoid UI freeze
        SwingWorker<Void, Void> worker = new SwingWorker<Void, Void>() {
            private int totalOrders = 0;
            private double todayRevenue = 0.0;
            private int activeTables = 0;
            private int lowStockItems = 0;
            
            @Override
            protected Void doInBackground() throws Exception {
                try (Connection conn = DatabaseConnection.getConnection()) {
                    // Get today's orders count
                    String ordersSql = "SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()";
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery(ordersSql)) {
                        if (rs.next()) {
                            totalOrders = rs.getInt("count");
                        }
                    }
                    
                    // Get today's revenue
                    String revenueSql = "SELECT COALESCE(SUM(total_amount), 0) as revenue FROM orders " +
                                       "WHERE DATE(created_at) = CURDATE() AND status != 'cancelled'";
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery(revenueSql)) {
                        if (rs.next()) {
                            todayRevenue = rs.getDouble("revenue");
                        }
                    }
                    
                    // Get active tables count
                    String tablesSql = "SELECT COUNT(*) as count FROM restaurant_tables WHERE status = 'occupied'";
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery(tablesSql)) {
                        if (rs.next()) {
                            activeTables = rs.getInt("count");
                        }
                    }
                    
                    // Get low stock items count
                    String stockSql = "SELECT COUNT(*) as count FROM inventory " +
                                     "WHERE quantity <= reorder_level";
                    try (Statement stmt = conn.createStatement();
                         ResultSet rs = stmt.executeQuery(stockSql)) {
                        if (rs.next()) {
                            lowStockItems = rs.getInt("count");
                        }
                    }
                } catch (SQLException e) {
                    System.err.println("Error loading dashboard data: " + e.getMessage());
                }
                return null;
            }
            
            @Override
            protected void done() {
                // Update UI on EDT
                totalOrdersLabel.setText(String.valueOf(totalOrders));
                todayRevenueLabel.setText(String.format("$%.2f", todayRevenue));
                activeTablesLabel.setText(String.valueOf(activeTables));
                lowStockItemsLabel.setText(String.valueOf(lowStockItems));
                
                // Change color if there are low stock items
                if (lowStockItems > 0) {
                    lowStockItemsLabel.setForeground(Color.RED);
                }
            }
        };
        
        worker.execute();
    }
    
    private void showMessage(String title, String message) {
        JOptionPane.showMessageDialog(this, message, title, JOptionPane.INFORMATION_MESSAGE);
    }
}
