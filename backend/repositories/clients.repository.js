const pool = require('../config/database');

const getAll = async () => {
    const [rows] = await pool.query(`
        SELECT
            id,
            name,
            email,
            phone,
            address,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM clients
        ORDER BY created_at DESC
    `);

    return rows;
};

const getById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            id,
            name,
            email,
            phone,
            address,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM clients
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const search = async (query) => {
    const [rows] = await pool.query(`
        SELECT
            id,
            name,
            email,
            phone,
            address,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM clients
        WHERE
            name LIKE ?
            OR email LIKE ?
            OR phone LIKE ?
            OR address LIKE ?
        ORDER BY name ASC
    `, [
        `%${query}%`,
        `%${query}%`,
        `%${query}%`,
        `%${query}%`
    ]);

    return rows;
};

const create = async (name, email, phone, address) => {
    const [result] = await pool.query(`
        INSERT INTO clients (
            name,
            email,
            phone,
            address
        )
        VALUES (?, ?, ?, ?)
    `, [
        name,
        email,
        phone,
        address
    ]);

    return result.insertId;
};

const update = async (id, name, email, phone, address) => {
    const [result] = await pool.query(`
        UPDATE clients
        SET
            name = ?,
            email = ?,
            phone = ?,
            address = ?
        WHERE id = ?
    `, [
        name,
        email,
        phone,
        address,
        id
    ]);

    return result.affectedRows;
};

const remove = async (id) => {
    const [result] = await pool.query(`
        DELETE FROM clients
        WHERE id = ?
    `, [id]);

    return result.affectedRows;
};

module.exports = {
    getAll,
    getById,
    search,
    create,
    update,
    remove
};