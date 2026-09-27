const pool = require('../config/database');

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

const getRolePermissions = async (roleId) => {
    const [rows] = await pool.query(`
        SELECT p.name
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
    `, [roleId]);
    return rows.map(r => r.name);
};

module.exports = { 
    findByEmail,
    getRolePermissions
};