const pool = require('../config/database');

const findAll = async () => {
    const [rows] = await pool.query(`
        SELECT 
            r.id, 
            r.name, 
            r.description, 
            r.created_at, 
            r.updated_at, 
            COUNT(rp.permission_id) AS permissions_count
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        GROUP BY r.id
        ORDER BY r.id ASC
    `);
    return rows;
};

const findById = async (id) => {
    const [rows] = await pool.query('SELECT id, name, description, created_at, updated_at FROM roles WHERE id = ?', [id]);
    return rows[0] || null;
};

const findByName = async (name) => {
    const [rows] = await pool.query('SELECT id, name, description FROM roles WHERE name = ?', [name]);
    return rows[0] || null;
};

const getRolePermissions = async (roleId) => {
    const [rows] = await pool.query(`
        SELECT p.id, p.name, p.description, p.module
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
        ORDER BY p.module, p.name
    `, [roleId]);
    return rows;
};

const create = async (name, description) => {
    const [result] = await pool.query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [name, description || null]
    );
    return result.insertId;
};

const update = async (id, name, description) => {
    await pool.query(
        'UPDATE roles SET name = ?, description = ? WHERE id = ?',
        [name, description || null, id]
    );
};

const deleteRole = async (id) => {
    await pool.query('DELETE FROM roles WHERE id = ?', [id]);
};

const countUsersWithRole = async (roleId) => {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM users WHERE role_id = ?', [roleId]);
    return rows[0]?.total || 0;
};

const clearPermissions = async (roleId) => {
    await pool.query('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
};

const assignPermissions = async (roleId, permissionIds) => {
    if (!permissionIds || permissionIds.length === 0) return;
    const values = permissionIds.map(permId => [roleId, permId]);
    await pool.query('INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES ?', [values]);
};

module.exports = {
    findAll,
    findById,
    findByName,
    getRolePermissions,
    create,
    update,
    deleteRole,
    countUsersWithRole,
    clearPermissions,
    assignPermissions
};
