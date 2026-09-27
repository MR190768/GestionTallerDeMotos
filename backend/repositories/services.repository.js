const pool = require('../config/database');

const motorcycleExists = async (motorcycleId) => {
    const [rows] = await pool.query(
        'SELECT id FROM motorcycles WHERE id = ?',
        [motorcycleId]
    );

    return rows.length > 0;
};

const getAll = async (status) => {
    let query = `
        SELECT
            s.id,
            s.motorcycle_id AS motorcycleId,
            s.description,
            s.cost,
            s.status,
            s.created_at AS createdAt,
            s.updated_at AS updatedAt,

            m.brand AS motorcycleBrand,
            m.model AS motorcycleModel,
            m.license_plate AS licensePlate,

            c.name AS clientName

        FROM services s

        INNER JOIN motorcycles m
            ON s.motorcycle_id = m.id

        INNER JOIN clients c
            ON m.client_id = c.id
    `;

    const params = [];

    if (status === 'ACTIVE') {
        query += ` WHERE s.status IN (?, ?)`;
        params.push('PENDING', 'IN_PROGRESS');
    } else if (status) {
        query += ` WHERE s.status = ?`;
        params.push(status);
    }

    query += ` ORDER BY s.created_at DESC`;

    const [rows] = await pool.query(query, params);

    return rows;
};

const getById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            s.id,
            s.motorcycle_id AS motorcycleId,
            s.description,
            s.cost,
            s.status,
            s.created_at AS createdAt,
            s.updated_at AS updatedAt,

            m.brand AS motorcycleBrand,
            m.model AS motorcycleModel,
            m.year AS motorcycleYear,
            m.license_plate AS licensePlate,

            c.id AS clientId,
            c.name AS clientName,
            c.phone AS clientPhone,
            c.email AS clientEmail

        FROM services s
        INNER JOIN motorcycles m
            ON s.motorcycle_id = m.id
        INNER JOIN clients c
            ON m.client_id = c.id

        WHERE s.id = ?
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