import com.restaurant.services.AuthService;
import com.restaurant.models.User;
import com.restaurant.utils.DatabaseConnection;
import com.restaurant.config.AppConfig;
import com.restaurant.views.DashboardView;
import com.restaurant.views.MenuManagementView;

import javax.swing.*;
import java.awt.*;
import java.sql.Connection;

public class Main {
    
    public static void main(String[] args) {
        // Set FlatLaf Look and Feel
        try {
            UIManager.setLookAndFeel(new com.formdev.flatlaf.FlatLightLaf());
        } catch (Exception e) {
            System.err.println("Failed to set FlatLaf look and feel: " + e.getMessage());
        }
        
        // Initialize configuration
        AppConfig config = AppConfig.getInstance();
        
        // Test database connection
        System.out.println("=== Restaurant Management System ===");
        System.out.println("Initializing application...");
        
        try {
            Connection conn = DatabaseConnection.getConnection();
            if (conn != null) {
                System.out.println("✓ Database connection successful!");
                System.out.println("✓ Database: " + config.getDbUrl());
                conn.close();
            } else {
                System.err.println("✗ Failed to connect to database");
                showError("Database Connection Failed", 
                    "Could not connect to the database. Please check your configuration.");
                return;
            }
        } catch (Exception e) {
            System.err.println("✗ Database connection error: " + e.getMessage());
            showError("Database Error", 
                "Database connection error: " + e.getMessage());
            return;
        }
        
        System.out.println("✓ Application initialized successfully!");
        System.out.println("\nDefault Login Credentials:");
        System.out.println("  Admin: admin / password123");
        System.out.println("  Manager: manager1 / password123");
        System.out.println("  Staff: staff1 / password123");
        System.out.println("\n=================================\n");
        
        // Launch login window
        SwingUtilities.invokeLater(() -> {
            showLoginDialog();
        });
    }
    
    private static void showLoginDialog() {
        JFrame loginFrame = new JFrame("Restaurant Management System - Login");
        loginFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        loginFrame.setSize(400, 300);
        loginFrame.setLocationRelativeTo(null);
        
        JPanel panel = new JPanel(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 10, 10);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        
        // Title
        JLabel titleLabel = new JLabel("Restaurant Management System");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 18));
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        panel.add(titleLabel, gbc);
        
        // Username
        gbc.gridwidth = 1;
        gbc.gridy = 1;
        gbc.gridx = 0;
        gbc.anchor = GridBagConstraints.EAST;
        panel.add(new JLabel("Username:"), gbc);
        
        gbc.gridx = 1;
        gbc.anchor = GridBagConstraints.WEST;
        JTextField usernameField = new JTextField(15);
        panel.add(usernameField, gbc);
        
        // Password
        gbc.gridy = 2;
        gbc.gridx = 0;
        gbc.anchor = GridBagConstraints.EAST;
        panel.add(new JLabel("Password:"), gbc);
        
        gbc.gridx = 1;
        gbc.anchor = GridBagConstraints.WEST;
        JPasswordField passwordField = new JPasswordField(15);
        panel.add(passwordField, gbc);
        
        // Buttons
        gbc.gridy = 3;
        gbc.gridx = 0;
        gbc.gridwidth = 2;
        gbc.anchor = GridBagConstraints.CENTER;
        
        JPanel buttonPanel = new JPanel(new FlowLayout());
        JButton loginButton = new JButton("Login");
        JButton exitButton = new JButton("Exit");
        
        buttonPanel.add(loginButton);
        buttonPanel.add(exitButton);
        panel.add(buttonPanel, gbc);
        
        // Status label
        gbc.gridy = 4;
        JLabel statusLabel = new JLabel(" ");
        statusLabel.setForeground(Color.RED);
        panel.add(statusLabel, gbc);
        
        // Login button action
        loginButton.addActionListener(e -> {
            String username = usernameField.getText().trim();
            String password = new String(passwordField.getPassword());
            
            if (username.isEmpty() || password.isEmpty()) {
                statusLabel.setText("Please enter username and password");
                return;
            }
            
            try {
                AuthService authService = new AuthService();
                User user = authService.authenticate(username, password);
                
                if (user != null) {
                    statusLabel.setForeground(Color.GREEN);
                    statusLabel.setText("Login successful!");
                    
                    // Close login window and show main application
                    loginFrame.dispose();
                    showMainApplication(user);
                }
            } catch (Exception ex) {
                statusLabel.setForeground(Color.RED);
                statusLabel.setText("Login failed: " + ex.getMessage());
            }
        });
        
        // Exit button action
        exitButton.addActionListener(e -> System.exit(0));
        
        // Enter key on password field
        passwordField.addActionListener(e -> loginButton.doClick());
        
        loginFrame.add(panel);
        loginFrame.setVisible(true);
    }
    
    private static void showMainApplication(User user) {
        JFrame mainFrame = new JFrame("Restaurant Management System");
        mainFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        mainFrame.setSize(1200, 800);
        mainFrame.setLocationRelativeTo(null);
        
        JPanel mainPanel = new JPanel(new BorderLayout());
        
        // Top menu bar
        JMenuBar menuBar = new JMenuBar();
        
        // File menu
        JMenu fileMenu = new JMenu("File");
        JMenuItem logoutItem = new JMenuItem("Logout");
        logoutItem.addActionListener(e -> {
            AuthService authService = new AuthService();
            authService.logout();
            mainFrame.dispose();
            showLoginDialog();
        });
        JMenuItem exitItem = new JMenuItem("Exit");
        exitItem.addActionListener(e -> System.exit(0));
        fileMenu.add(logoutItem);
        fileMenu.addSeparator();
        fileMenu.add(exitItem);
        menuBar.add(fileMenu);
        
        // Orders menu
        if (hasPermission(user, "orders")) {
            JMenu ordersMenu = new JMenu("Orders");
            JMenuItem newOrderItem = new JMenuItem("New Order");
            JMenuItem viewOrdersItem = new JMenuItem("View Orders");
            ordersMenu.add(newOrderItem);
            ordersMenu.add(viewOrdersItem);
            menuBar.add(ordersMenu);
        }
        
        // Menu management
        if (hasPermission(user, "menu")) {
            JMenu menuManagement = new JMenu("Menu");
            JMenuItem viewMenuItems = new JMenuItem("View Menu Items");
            viewMenuItems.addActionListener(e -> showMenuManagement(mainFrame, user, mainPanel));
            JMenuItem addMenuItem = new JMenuItem("Add Menu Item");
            menuManagement.add(viewMenuItems);
            menuManagement.add(addMenuItem);
            menuBar.add(menuManagement);
        }
        
        // Inventory menu
        if (hasPermission(user, "inventory")) {
            JMenu inventoryMenu = new JMenu("Inventory");
            JMenuItem viewInventory = new JMenuItem("View Inventory");
            JMenuItem addStock = new JMenuItem("Add Stock");
            inventoryMenu.add(viewInventory);
            inventoryMenu.add(addStock);
            menuBar.add(inventoryMenu);
        }
        
        // Reports menu
        if (hasPermission(user, "reports")) {
            JMenu reportsMenu = new JMenu("Reports");
            JMenuItem salesReport = new JMenuItem("Sales Report");
            JMenuItem inventoryReport = new JMenuItem("Inventory Report");
            reportsMenu.add(salesReport);
            reportsMenu.add(inventoryReport);
            menuBar.add(reportsMenu);
        }
        // Help menu
        JMenu helpMenu = new JMenu("Help");
        JMenuItem aboutItem = new JMenuItem("About");
        aboutItem.addActionListener(e -> {
            JOptionPane.showMessageDialog(mainFrame, 
                "Restaurant Management System v1.0\n\nDeveloped for DBMS Project\n\n" +
                "User: " + user.getFullName() + "\nRole: " + user.getRole().getRoleName(),
                "About", JOptionPane.INFORMATION_MESSAGE);
        });
        helpMenu.add(aboutItem);
        menuBar.add(helpMenu);
        
        mainFrame.setJMenuBar(menuBar);
        
        // Add dashboard view
        DashboardView dashboardView = new DashboardView(user, mainFrame);
        mainPanel.add(dashboardView, BorderLayout.CENTER);
        
        mainFrame.add(mainPanel);
        mainFrame.setVisible(true);
        
        System.out.println("User logged in: " + user.getUsername());
        System.out.println("Role: " + user.getRole().getRoleName());
        System.out.println("Permissions: " + user.getRole().getPermissions());
    }
    
    private static boolean hasPermission(User user, String permission) {
        String roleName = user.getRole().getRoleName().toLowerCase();
        
        if (roleName.equals("admin")) {
            return true;
        }
        
        for (String perm : user.getRole().getPermissions()) {
            if (perm.equals("*") || perm.startsWith(permission)) {
                return true;
            }
        }
        
        return false;
    }
    
    private static void showMenuManagement(JFrame frame, User user, JPanel mainPanel) {
        mainPanel.removeAll();
        MenuManagementView menuView = new MenuManagementView(user);
        mainPanel.add(menuView, BorderLayout.CENTER);
        mainPanel.revalidate();
        mainPanel.repaint();
    }
    
    private static void showError(String title, String message) {
        JOptionPane.showMessageDialog(null, message, title, JOptionPane.ERROR_MESSAGE);
    }
}
