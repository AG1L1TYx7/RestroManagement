const MenuItem = require('../models/MenuItem');
const path = require('path');
const fs = require('fs');

/**
 * Upload image for menu item
 * @route POST /api/v1/menu-items/:id/image
 * @access Private (Admin/Manager)
 */
const uploadMenuItemImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if menu item exists
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            // Delete uploaded file if item doesn't exist
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file provided'
            });
        }

        // Delete old image if exists
        if (menuItem.image_url) {
            const oldImagePath = path.join(__dirname, '../uploads/menu', path.basename(menuItem.image_url));
            if (fs.existsSync(oldImagePath)) {
                try {
                    fs.unlinkSync(oldImagePath);
                } catch (error) {
                    console.error('Error deleting old image:', error);
                }
            }
        }

        // Generate image URL
        const imageUrl = `/uploads/menu/${req.file.filename}`;

        // Update menu item with new image URL
        const updatedItem = await MenuItem.update(id, { image_url: imageUrl });

        res.status(200).json({
            status: 'success',
            message: 'Image uploaded successfully',
            data: {
                item_id: updatedItem.item_id,
                name: updatedItem.name,
                image_url: updatedItem.image_url,
                filename: req.file.filename,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });
    } catch (error) {
        // Delete uploaded file on error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        console.error('Upload menu item image error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to upload image',
            error: error.message
        });
    }
};

/**
 * Delete menu item image
 * @route DELETE /api/v1/menu-items/:id/image
 * @access Private (Admin/Manager)
 */
const deleteMenuItemImage = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if menu item exists
        const menuItem = await MenuItem.findById(id);
        if (!menuItem) {
            return res.status(404).json({
                status: 'error',
                message: 'Menu item not found'
            });
        }

        if (!menuItem.image_url) {
            return res.status(400).json({
                status: 'error',
                message: 'Menu item has no image'
            });
        }

        // Delete image file
        const imagePath = path.join(__dirname, '../uploads/menu', path.basename(menuItem.image_url));
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        // Update menu item to remove image URL
        await MenuItem.update(id, { image_url: null });

        res.status(200).json({
            status: 'success',
            message: 'Image deleted successfully'
        });
    } catch (error) {
        console.error('Delete menu item image error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete image',
            error: error.message
        });
    }
};

module.exports = {
    uploadMenuItemImage,
    deleteMenuItemImage
};
