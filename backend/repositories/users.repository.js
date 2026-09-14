const pool = require('../config/database');
const findAll = async () => {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users');
    return rows;
};
const findByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};
const createUser = async (name, email, password, role) => {
    const [result] = await pool.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, password, role]);
    return result.insertId;
};
const deleteUser = async (id) => {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
};
module.exports = { findAll, findByEmail, createUser, deleteUser };