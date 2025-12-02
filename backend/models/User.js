const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Object} Created user
     */
    static async create({ username, email, password, full_name, role, phone }) {
        const connection = await pool.getConnection();
        try {
            // Hash password
            const password_hash = await bcrypt.hash(password, 10);
            
            // Insert user
            const [result] = await connection.query(
                `INSERT INTO users (username, email, password_hash, full_name, role, phone, is_active) 
                 VALUES (?, ?, ?, ?, ?, ?, true)`,
                [username, email, password_hash, full_name, role, phone]
            );
            
            // Return created user without password
            return await this.findById(result.insertId);
        } finally {
            connection.release();
        }
    }

    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Object|null} User object or null
     */
    static async findById(id) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT user_id, username, email, full_name, role, phone, is_active, 
                        created_at, updated_at, last_login 
                 FROM users 
                 WHERE user_id = ?`,
                [id]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Find user by email (includes password for authentication)
     * @param {string} email - User email
     * @returns {Object|null} User object with password or null
     */
    static async findByEmail(email) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT user_id, username, email, password_hash, full_name, role, 
                        phone, is_active, created_at, updated_at, last_login 
                 FROM users 
                 WHERE email = ?`,
                [email]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Find user by username (includes password for authentication)
     * @param {string} username - Username
     * @returns {Object|null} User object with password or null
     */
    static async findByUsername(username) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT user_id, username, email, password_hash, full_name, role, 
                        phone, is_active, created_at, updated_at, last_login 
                 FROM users 
                 WHERE username = ?`,
                [username]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Find user by email or username
     * @param {string} identifier - Email or username
     * @returns {Object|null} User object with password or null
     */
    static async findByEmailOrUsername(identifier) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT user_id, username, email, password_hash, full_name, role, 
                        phone, is_active, created_at, updated_at, last_login 
                 FROM users 
                 WHERE email = ? OR username = ?`,
                [identifier, identifier]
            );
            
            return rows[0] || null;
        } finally {
            connection.release();
        }
    }

    /**
     * Update user's last login timestamp
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async updateLastLogin(userId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?`,
                [userId]
            );
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Update user profile
     * @param {number} userId - User ID
     * @param {Object} updates - Fields to update
     * @returns {Object|null} Updated user
     */
    static async update(userId, updates) {
        const connection = await pool.getConnection();
        try {
            const allowedFields = ['full_name', 'phone', 'email'];
            const updateFields = [];
            const values = [];

            for (const [key, value] of Object.entries(updates)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    updateFields.push(`${key} = ?`);
                    values.push(value);
                }
            }

            if (updateFields.length === 0) {
                throw new Error('No valid fields to update');
            }

            values.push(userId);
            await connection.query(
                `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
                values
            );

            return await this.findById(userId);
        } finally {
            connection.release();
        }
    }

    /**
     * Update user password
     * @param {number} userId - User ID
     * @param {string} newPassword - New password
     * @returns {boolean} Success status
     */
    static async updatePassword(userId, newPassword) {
        const connection = await pool.getConnection();
        try {
            const password_hash = await bcrypt.hash(newPassword, 10);
            await connection.query(
                `UPDATE users SET password_hash = ? WHERE user_id = ?`,
                [password_hash, userId]
            );
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Compare password with hash
     * @param {string} password - Plain text password
     * @param {string} hash - Hashed password
     * @returns {boolean} Match status
     */
    static async comparePassword(password, hash) {
        // Support plain text passwords for development (NOT for production!)
        if (process.env.NODE_ENV === 'development' && !hash.startsWith('$2b$')) {
            return password === hash;
        }
        return await bcrypt.compare(password, hash);
    }

    /**
     * Check if email exists
     * @param {string} email - Email to check
     * @returns {boolean} Exists status
     */
    static async emailExists(email) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT COUNT(*) as count FROM users WHERE email = ?`,
                [email]
            );
            return rows[0].count > 0;
        } finally {
            connection.release();
        }
    }

    /**
     * Check if username exists
     * @param {string} username - Username to check
     * @returns {boolean} Exists status
     */
    static async usernameExists(username) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT COUNT(*) as count FROM users WHERE username = ?`,
                [username]
            );
            return rows[0].count > 0;
        } finally {
            connection.release();
        }
    }

    /**
     * Get all users (admin only)
     * @returns {Array} Array of users
     */
    static async getAll() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.query(
                `SELECT user_id, username, email, full_name, role, phone, is_active, 
                        created_at, updated_at, last_login 
                 FROM users 
                 ORDER BY created_at DESC`
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    /**
     * Deactivate user account
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async deactivate(userId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE users SET is_active = false WHERE user_id = ?`,
                [userId]
            );
            return true;
        } finally {
            connection.release();
        }
    }

    /**
     * Activate user account
     * @param {number} userId - User ID
     * @returns {boolean} Success status
     */
    static async activate(userId) {
        const connection = await pool.getConnection();
        try {
            await connection.query(
                `UPDATE users SET is_active = true WHERE user_id = ?`,
                [userId]
            );
            return true;
        } finally {
            connection.release();
        }
    }
}

module.exports = User;
