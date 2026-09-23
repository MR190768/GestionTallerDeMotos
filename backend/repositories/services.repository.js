const pool = require('../config/database');

const motorcycleExists = async (motorcycleId) => {
    const [rows] = await pool.query(
        'SELECT id FROM motorcycles WHERE id = ?',
        [motorcycleId]
    );

    return rows.length > 0;
};

const getAll = async () => {
    const [rows] = await pool.query(`
        SELECT
            id,
            motorcycle_id AS motorcycleId,
            description,
            cost,
            status,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM services
        ORDER BY created_at DESC
    `);

    return rows;
};

const getById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            id,
            motorcycle_id AS motorcycleId,
            description,
            cost,
            status,
            created_at AS createdAt,
            updated_at AS updatedAt
        FROM services
        WHERE id = ?
    `, [id]);

    return rows[0];
};

const create = async (motorcycleId, description, cost) => {
    const [result] = await pool.query(`
        INSERT INTO services (
            motorcycle_id,
            description,
            cost
        )
        VALUES (?, ?, ?)
    `, [motorcycleId, description, cost]);

    return result.insertId;
};

const update = async (id, motorcycleId, description, cost) => {
    const [result] = await pool.query(`
        UPDATE services
        SET
            motorcycle_id = ?,
            description = ?,
            cost = ?
        WHERE id = ?
    `, [motorcycleId, description, cost, id]);

    return result.affectedRows;
};

const updateStatus = async (id, status) => {
    const [result] = await pool.query(`
        UPDATE services
        SET status = ?
        WHERE id = ?
    `, [status, id]);

    return result.affectedRows;
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    updateStatus,
    motorcycleExists
};