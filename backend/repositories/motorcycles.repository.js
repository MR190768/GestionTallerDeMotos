const pool = require('../config/database');

/**
 * Escapa comodines para búsquedas LIKE
 */
const escapeWildcards = (str) => str.replace(/[\\%_]/g, '\\$&');

/**
 * Lista todas las motocicletas con datos del cliente y conteo de servicios.
 * Admite filtro de búsqueda por placa, marca, modelo o nombre del cliente.
 */
const findAll = async ({ search } = {}) => {
    let query = `
        SELECT
            m.id,
            m.client_id AS clientId,
            m.brand,
            m.model,
            m.year,
            m.license_plate AS licensePlate,
            m.created_at AS createdAt,
            m.updated_at AS updatedAt,
            c.name AS clientName,
            c.phone AS clientPhone,
            c.email AS clientEmail,
            COUNT(s.id) AS serviceCount
        FROM motorcycles m
        INNER JOIN clients c ON m.client_id = c.id
        LEFT JOIN services s ON s.motorcycle_id = m.id
    `;
    const params = [];

    if (search && search.trim()) {
        const pattern = `%${escapeWildcards(search.trim())}%`;
        query += `
            WHERE (
                m.license_plate LIKE ? OR
                m.brand LIKE ? OR
                m.model LIKE ? OR
                c.name LIKE ?
            )
        `;
        params.push(pattern, pattern, pattern, pattern);
    }

    query += `
        GROUP BY m.id
        ORDER BY m.created_at DESC
    `;

    const [rows] = await pool.query(query, params);
    return rows;
};

/**
 * Obtiene el detalle de una motocicleta por su ID con información del propietario.
 */
const findById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            m.id,
            m.client_id AS clientId,
            m.brand,
            m.model,
            m.year,
            m.license_plate AS licensePlate,
            m.created_at AS createdAt,
            m.updated_at AS updatedAt,
            c.name AS clientName,
            c.phone AS clientPhone,
            c.email AS clientEmail,
            c.address AS clientAddress
        FROM motorcycles m
        INNER JOIN clients c ON m.client_id = c.id
        WHERE m.id = ?
    `, [id]);

    return rows[0] || null;
};

/**
 * Busca motocicletas por placa exacta o coincidencia parcial.
 */
const findByPlate = async (plate) => {
    const pattern = `%${escapeWildcards(plate.trim())}%`;
    const [rows] = await pool.query(`
        SELECT
            m.id,
            m.client_id AS clientId,
            m.brand,
            m.model,
            m.year,
            m.license_plate AS licensePlate,
            m.created_at AS createdAt,
            m.updated_at AS updatedAt,
            c.name AS clientName,
            c.phone AS clientPhone,
            c.email AS clientEmail
        FROM motorcycles m
        INNER JOIN clients c ON m.client_id = c.id
        WHERE m.license_plate LIKE ?
        ORDER BY m.license_plate ASC
    `, [pattern]);

    return rows;
};

/**
 * Retorna las motocicletas asociadas a un cliente específico.
 */
const findByClientId = async (clientId) => {
    const [rows] = await pool.query(`
        SELECT
            m.id,
            m.client_id AS clientId,
            m.brand,
            m.model,
            m.year,
            m.license_plate AS licensePlate,
            m.created_at AS createdAt,
            m.updated_at AS updatedAt,
            COUNT(s.id) AS serviceCount
        FROM motorcycles m
        LEFT JOIN services s ON s.motorcycle_id = m.id
        WHERE m.client_id = ?
        GROUP BY m.id
        ORDER BY m.created_at DESC
    `, [clientId]);

    return rows;
};

/**
 * Obtiene el historial de órdenes de servicio para una motocicleta.
 */
const getServiceHistory = async (motorcycleId) => {
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
        WHERE motorcycle_id = ?
        ORDER BY created_at DESC
    `, [motorcycleId]);

    return rows;
};

/**
 * Verifica si ya existe una motocicleta con la misma placa (excluyendo un ID si es edición).
 */
const existsByPlate = async (licensePlate, excludeId = null) => {
    let query = 'SELECT id FROM motorcycles WHERE license_plate = ?';
    const params = [licensePlate.trim().toUpperCase()];

    if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
    }

    const [rows] = await pool.query(query, params);
    return rows.length > 0;
};

/**
 * Inserta una nueva motocicleta vinculada a un cliente.
 */
const create = async ({ clientId, brand, model, year, licensePlate }) => {
    const [result] = await pool.query(`
        INSERT INTO motorcycles (client_id, brand, model, year, license_plate)
        VALUES (?, ?, ?, ?, ?)
    `, [
        clientId,
        brand.trim(),
        model.trim(),
        year ? parseInt(year, 10) : null,
        licensePlate ? licensePlate.trim().toUpperCase() : null
    ]);

    return result.insertId;
};

/**
 * Actualiza los datos de una motocicleta.
 */
const update = async (id, { clientId, brand, model, year, licensePlate }) => {
    await pool.query(`
        UPDATE motorcycles
        SET 
            client_id = ?,
            brand = ?,
            model = ?,
            year = ?,
            license_plate = ?
        WHERE id = ?
    `, [
        clientId,
        brand.trim(),
        model.trim(),
        year ? parseInt(year, 10) : null,
        licensePlate ? licensePlate.trim().toUpperCase() : null,
        id
    ]);
};

/**
 * Elimina una motocicleta por ID.
 */
const deleteById = async (id) => {
    const [result] = await pool.query('DELETE FROM motorcycles WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    findAll,
    findById,
    findByPlate,
    findByClientId,
    getServiceHistory,
    existsByPlate,
    create,
    update,
    deleteById
};