package com.restaurant.views;

import com.restaurant.models.User;
import com.restaurant.models.MenuItem;
import com.restaurant.models.Category;
import com.restaurant.services.MenuService;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;
import java.awt.*;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.List;

public class MenuManagementView extends JPanel {
    private User currentUser;
    private MenuService menuService;
    private JTable menuTable;
    private DefaultTableModel tableModel;
    private JComboBox<Category> categoryFilter;
    private JTextField searchField;
    
    public MenuManagementView(User user) {
        this.currentUser = user;
        this.menuService = new MenuService();
        
        setLayout(new BorderLayout(10, 10));
        setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        
        add(createHeaderPanel(), BorderLayout.NORTH);
        add(createTablePanel(), BorderLayout.CENTER);
        add(createButtonPanel(), BorderLayout.SOUTH);
        
        loadMenuItems();
    }
    
    private JPanel createHeaderPanel() {
        JPanel panel = new JPanel(new BorderLayout());
        
        JLabel titleLabel = new JLabel("Menu Management");
        titleLabel.setFont(new Font("Arial", Font.BOLD, 24));
        panel.add(titleLabel, BorderLayout.WEST);
        
        // Search and filter panel
        JPanel filterPanel = new JPanel(new FlowLayout(FlowLayout.RIGHT));
        
        JLabel searchLabel = new JLabel("Search:");
        searchField = new JTextField(15);
        JButton searchButton = new JButton("🔍 Search");
        searchButton.addActionListener(e -> performSearch());
        
        JLabel categoryLabel = new JLabel("Category:");
        categoryFilter = new JComboBox<>();
        categoryFilter.addItem(null); // All categories
        loadCategories();
        categoryFilter.addActionListener(e -> filterByCategory());
        
        filterPanel.add(searchLabel);
        filterPanel.add(searchField);
        filterPanel.add(searchButton);
        filterPanel.add(categoryLabel);
        filterPanel.add(categoryFilter);
        
        panel.add(filterPanel, BorderLayout.EAST);
        
        return panel;
    }
    
    private JPanel createTablePanel() {
        JPanel panel = new JPanel(new BorderLayout());
        
        // Table model
        String[] columns = {"ID", "Name", "Category", "Price", "Cost", "Profit", "Available", "Featured"};
        tableModel = new DefaultTableModel(columns, 0) {
            @Override
            public boolean isCellEditable(int row, int column) {
                return false;
            }
        };
        
        menuTable = new JTable(tableModel);
        menuTable.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
        menuTable.setRowHeight(25);
        menuTable.getColumnModel().getColumn(0).setPreferredWidth(50);
        menuTable.getColumnModel().getColumn(1).setPreferredWidth(200);
        
        JScrollPane scrollPane = new JScrollPane(menuTable);
        panel.add(scrollPane, BorderLayout.CENTER);
        
        return panel;
    }
    
    private JPanel createButtonPanel() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 10));
        
        JButton addButton = new JButton("➕ Add Menu Item");
        addButton.setPreferredSize(new Dimension(150, 35));
        addButton.addActionListener(e -> showAddDialog());
        
        JButton editButton = new JButton("✏️ Edit");
        editButton.setPreferredSize(new Dimension(120, 35));
        editButton.addActionListener(e -> showEditDialog());
        
        JButton toggleButton = new JButton("🔄 Toggle Available");
        toggleButton.setPreferredSize(new Dimension(150, 35));
        toggleButton.addActionListener(e -> toggleAvailability());
        
        JButton deleteButton = new JButton("🗑️ Delete");
        deleteButton.setPreferredSize(new Dimension(120, 35));
        deleteButton.addActionListener(e -> deleteMenuItem());
        
        JButton refreshButton = new JButton("🔄 Refresh");
        refreshButton.setPreferredSize(new Dimension(120, 35));
        refreshButton.addActionListener(e -> loadMenuItems());
        
        panel.add(addButton);
        panel.add(editButton);
        panel.add(toggleButton);
        panel.add(deleteButton);
        panel.add(refreshButton);
        
        return panel;
    }
    
    private void loadMenuItems() {
        tableModel.setRowCount(0);
        try {
            List<MenuItem> items = menuService.getAllMenuItems();
            for (MenuItem item : items) {
                addRowToTable(item);
            }
        } catch (SQLException e) {
            showError("Error loading menu items: " + e.getMessage());
        }
    }
    
    private void loadCategories() {
        try {
            List<Category> categories = menuService.getAllCategories();
            for (Category category : categories) {
                categoryFilter.addItem(category);
            }
        } catch (SQLException e) {
            showError("Error loading categories: " + e.getMessage());
        }
    }
    
    private void addRowToTable(MenuItem item) {
        BigDecimal profit = item.getPrice().subtract(item.getCost());
        Object[] row = {
            item.getItemId(),
            item.getName(),
            item.getCategory().getCategoryName(),
            "$" + item.getPrice(),
            "$" + item.getCost(),
            "$" + profit,
            item.isAvailable() ? "✓" : "✗",
            item.isFeatured() ? "⭐" : ""
        };
        tableModel.addRow(row);
    }
    
    private void performSearch() {
        String keyword = searchField.getText().trim();
        if (keyword.isEmpty()) {
            loadMenuItems();
            return;
        }
        
        tableModel.setRowCount(0);
        try {
            List<MenuItem> items = menuService.searchMenuItems(keyword);
            for (MenuItem item : items) {
                addRowToTable(item);
            }
        } catch (SQLException e) {
            showError("Error searching menu items: " + e.getMessage());
        }
    }
    
    private void filterByCategory() {
        Category selectedCategory = (Category) categoryFilter.getSelectedItem();
        if (selectedCategory == null) {
            loadMenuItems();
            return;
        }
        
        tableModel.setRowCount(0);
        try {
            List<MenuItem> items = menuService.getMenuItemsByCategory(selectedCategory.getCategoryId());
            for (MenuItem item : items) {
                addRowToTable(item);
            }
        } catch (SQLException e) {
            showError("Error filtering menu items: " + e.getMessage());
        }
    }
    
    private void showAddDialog() {
        MenuItemDialog dialog = new MenuItemDialog(null, menuService);
        dialog.setVisible(true);
        if (dialog.isSuccessful()) {
            loadMenuItems();
        }
    }
    
    private void showEditDialog() {
        int selectedRow = menuTable.getSelectedRow();
        if (selectedRow == -1) {
            showWarning("Please select a menu item to edit");
            return;
        }
        
        int itemId = (int) tableModel.getValueAt(selectedRow, 0);
        try {
            MenuItem item = menuService.getMenuItemById(itemId);
            MenuItemDialog dialog = new MenuItemDialog(item, menuService);
            dialog.setVisible(true);
            if (dialog.isSuccessful()) {
                loadMenuItems();
            }
        } catch (SQLException e) {
            showError("Error loading menu item: " + e.getMessage());
        }
    }
    
    private void toggleAvailability() {
        int selectedRow = menuTable.getSelectedRow();
        if (selectedRow == -1) {
            showWarning("Please select a menu item");
            return;
        }
        
        int itemId = (int) tableModel.getValueAt(selectedRow, 0);
        try {
            if (menuService.toggleMenuItemAvailability(itemId)) {
                loadMenuItems();
            }
        } catch (SQLException e) {
            showError("Error updating availability: " + e.getMessage());
        }
    }
    
    private void deleteMenuItem() {
        int selectedRow = menuTable.getSelectedRow();
        if (selectedRow == -1) {
            showWarning("Please select a menu item to delete");
            return;
        }
        
        int confirm = JOptionPane.showConfirmDialog(this,
            "Are you sure you want to delete this menu item?",
            "Confirm Delete", JOptionPane.YES_NO_OPTION);
        
        if (confirm == JOptionPane.YES_OPTION) {
            int itemId = (int) tableModel.getValueAt(selectedRow, 0);
            try {
                if (menuService.deleteMenuItem(itemId)) {
                    loadMenuItems();
                    showInfo("Menu item deleted successfully");
                }
            } catch (SQLException e) {
                showError("Error deleting menu item: " + e.getMessage());
            }
        }
    }
    
    private void showError(String message) {
        JOptionPane.showMessageDialog(this, message, "Error", JOptionPane.ERROR_MESSAGE);
    }
    
    private void showWarning(String message) {
        JOptionPane.showMessageDialog(this, message, "Warning", JOptionPane.WARNING_MESSAGE);
    }
    
    private void showInfo(String message) {
        JOptionPane.showMessageDialog(this, message, "Success", JOptionPane.INFORMATION_MESSAGE);
    }
}

// Dialog for adding/editing menu items
class MenuItemDialog extends JDialog {
    private MenuItem menuItem;
    private MenuService menuService;
    private boolean successful = false;
    
    private JTextField nameField;
    private JTextArea descriptionArea;
    private JTextField priceField;
    private JTextField costField;
    private JComboBox<Category> categoryCombo;
    private JCheckBox availableCheck;
    private JCheckBox featuredCheck;
    private JTextField prepTimeField;
    
    public MenuItemDialog(MenuItem item, MenuService service) {
        this.menuItem = item;
        this.menuService = service;
        
        setTitle(item == null ? "Add Menu Item" : "Edit Menu Item");
        setModal(true);
        setSize(500, 600);
        setLocationRelativeTo(null);
        
        setLayout(new BorderLayout(10, 10));
        add(createFormPanel(), BorderLayout.CENTER);
        add(createButtonPanel(), BorderLayout.SOUTH);
        
        if (item != null) {
            populateFields();
        }
    }
    
    private JPanel createFormPanel() {
        JPanel panel = new JPanel(new GridBagLayout());
        panel.setBorder(BorderFactory.createEmptyBorder(20, 20, 20, 20));
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(5, 5, 5, 5);
        
        int row = 0;
        
        // Name
        gbc.gridx = 0; gbc.gridy = row;
        panel.add(new JLabel("Name:*"), gbc);
        gbc.gridx = 1;
        nameField = new JTextField(20);
        panel.add(nameField, gbc);
        row++;
        
        // Description
        gbc.gridx = 0; gbc.gridy = row;
        panel.add(new JLabel("Description:"), gbc);
        gbc.gridx = 1;
        descriptionArea = new JTextArea(3, 20);
        panel.add(new JScrollPane(descriptionArea), gbc);
        row++;
        
        // Price
        gbc.gridx = 0; gbc.gridy = row;
        panel.add(new JLabel("Price:*"), gbc);
        gbc.gridx = 1;
        priceField = new JTextField(20);
        panel.add(priceField, gbc);
        row++;
        
        // Cost
        gbc.gridx = 0; gbc.gridy = row;
        panel.add(new JLabel("Cost:*"), gbc);
        gbc.gridx = 1;
        costField = new JTextField(20);
        panel.add(costField, gbc);
        row++;
        
        // Category
        gbc.gridx = 0; gbc.gridy = row;
        panel.add(new JLabel("Category:*"), gbc);
        gbc.gridx = 1;
        categoryCombo = new JComboBox<>();
        loadCategories();
        panel.add(categoryCombo, gbc);
        row++;
        
        // Preparation Time
        gbc.gridx = 0; gbc.gridy = row;
        panel.add(new JLabel("Prep Time (min):"), gbc);
        gbc.gridx = 1;
        prepTimeField = new JTextField(20);
        prepTimeField.setText("15");
        panel.add(prepTimeField, gbc);
        row++;
        
        // Available
        gbc.gridx = 0; gbc.gridy = row;
        panel.add(new JLabel("Available:"), gbc);
        gbc.gridx = 1;
        availableCheck = new JCheckBox();
        availableCheck.setSelected(true);
        panel.add(availableCheck, gbc);
        row++;
        
        // Featured
        gbc.gridx = 0; gbc.gridy = row;
        panel.add(new JLabel("Featured:"), gbc);
        gbc.gridx = 1;
        featuredCheck = new JCheckBox();
        panel.add(featuredCheck, gbc);
        
        return panel;
    }
    
    private JPanel createButtonPanel() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER));
        
        JButton saveButton = new JButton("💾 Save");
        saveButton.setPreferredSize(new Dimension(100, 35));
        saveButton.addActionListener(e -> saveMenuItem());
        
        JButton cancelButton = new JButton("✖️ Cancel");
        cancelButton.setPreferredSize(new Dimension(100, 35));
        cancelButton.addActionListener(e -> dispose());
        
        panel.add(saveButton);
        panel.add(cancelButton);
        
        return panel;
    }
    
    private void loadCategories() {
        try {
            List<Category> categories = menuService.getActiveCategories();
            for (Category category : categories) {
                categoryCombo.addItem(category);
            }
        } catch (SQLException e) {
            JOptionPane.showMessageDialog(this, "Error loading categories: " + e.getMessage());
        }
    }
    
    private void populateFields() {
        nameField.setText(menuItem.getName());
        descriptionArea.setText(menuItem.getDescription());
        priceField.setText(menuItem.getPrice().toString());
        costField.setText(menuItem.getCost().toString());
        prepTimeField.setText(String.valueOf(menuItem.getPreparationTime()));
        availableCheck.setSelected(menuItem.isAvailable());
        featuredCheck.setSelected(menuItem.isFeatured());
        
        // Select category
        for (int i = 0; i < categoryCombo.getItemCount(); i++) {
            Category cat = categoryCombo.getItemAt(i);
            if (cat.getCategoryId() == menuItem.getCategory().getCategoryId()) {
                categoryCombo.setSelectedIndex(i);
                break;
            }
        }
    }
    
    private void saveMenuItem() {
        try {
            // Validate
            if (nameField.getText().trim().isEmpty()) {
                JOptionPane.showMessageDialog(this, "Name is required");
                return;
            }
            
            if (categoryCombo.getSelectedItem() == null) {
                JOptionPane.showMessageDialog(this, "Category is required");
                return;
            }
            
            // Create/update menu item
            if (menuItem == null) {
                menuItem = new MenuItem();
            }
            
            menuItem.setName(nameField.getText().trim());
            menuItem.setDescription(descriptionArea.getText().trim());
            menuItem.setPrice(new BigDecimal(priceField.getText()));
            menuItem.setCost(new BigDecimal(costField.getText()));
            menuItem.setCategory((Category) categoryCombo.getSelectedItem());
            menuItem.setPreparationTime(Integer.parseInt(prepTimeField.getText()));
            menuItem.setAvailable(availableCheck.isSelected());
            menuItem.setFeatured(featuredCheck.isSelected());
            
            // Save
            if (menuItem.getItemId() == 0) {
                menuService.createMenuItem(menuItem);
            } else {
                menuService.updateMenuItem(menuItem);
            }
            
            successful = true;
            dispose();
            
        } catch (NumberFormatException e) {
            JOptionPane.showMessageDialog(this, "Invalid number format");
        } catch (Exception e) {
            JOptionPane.showMessageDialog(this, "Error saving: " + e.getMessage());
        }
    }
    
    public boolean isSuccessful() {
        return successful;
    }
}
