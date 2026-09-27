const pool = require('../config/database');

const findAll = async () => {
    const [rows] = await pool.query(`
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.role_id, 
            r.name AS role_name, 
            r.description AS role_description, 
            u.created_at
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        ORDER BY u.id ASC
    `);
    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.query(`
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.role_id, 
            r.name AS role_name,
            u.created_at
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.id = ?
    `, [id]);
    return rows[0] || null;
};

const findByEmail = async (email) => {
    const [rows] = await pool.query(`
        SELECT 
            u.id, 
            u.name, 
            u.email, 
            u.password, 
            u.role_id, 
            r.name AS role_name
        FROM users u
        INNER JOIN roles r ON u.role_id = r.id
        WHERE u.email = ?
    `, [email]);
    return rows[0] || null;
};

const createUser = async (name, email, password, roleId) => {
    const [result] = await pool.query(
        'INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)',
        [name, email, password, roleId]
    );
    return result.insertId;
};

const updateUser = async (id, name, email, roleId) => {
    await pool.query(
        'UPDATE users SET name = ?, email = ?, role_id = ? WHERE id = ?',
        [name, email, roleId, id]
    );
};

const deleteUser = async (id) => {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
};

module.exports = {
    findAll,
    findById,
    findByEmail,
    createUser,
    updateUser,
    deleteUser
};