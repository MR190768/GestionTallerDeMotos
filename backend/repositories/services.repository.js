const pool = require('../config/database');

const motorcycleExists = async (motorcycleId) => {
    const [rows] = await pool.query(
        'SELECT id FROM motorcycles WHERE id = ?',
        [motorcycleId]
    );

    return rows.length > 0;
};

const getPartsByServiceId = async (serviceId) => {
    const [rows] = await pool.query(`
        SELECT
            sp.id,
            sp.service_id AS serviceId,
            sp.part_id AS partId,
            sp.quantity,
            sp.unit_price AS unitPrice,
            (sp.quantity * sp.unit_price) AS subtotal,
            sp.created_at AS createdAt,
            p.code AS partCode,
            p.name AS partName,
            p.stock AS currentStock
        FROM service_parts sp
        INNER JOIN parts p ON sp.part_id = p.id
        WHERE sp.service_id = ?
        ORDER BY sp.id ASC
    `, [serviceId]);

    return rows;
};

const getAll = async (status) => {
    let query = `
        SELECT
            s.id,
            s.motorcycle_id AS motorcycleId,
            s.description,
            s.cost,
            s.cost AS laborCost,
            COALESCE(sp_summary.partsCost, 0) AS partsCost,
            (s.cost + COALESCE(sp_summary.partsCost, 0)) AS totalCost,
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

        LEFT JOIN (
            SELECT service_id, SUM(quantity * unit_price) AS partsCost
            FROM service_parts
            GROUP BY service_id
        ) sp_summary ON sp_summary.service_id = s.id
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
            s.cost AS laborCost,
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

    if (!rows[0]) return null;

    const service = rows[0];
    const parts = await getPartsByServiceId(id);
    const partsCost = parts.reduce((sum, p) => sum + Number(p.subtotal), 0);
    const totalCost = Number(service.cost) + partsCost;

    return {
        ...service,
        laborCost: Number(service.cost),
        partsCost,
        totalCost,
        parts
    };
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

const addPartToService = async (serviceId, partId, quantity, userId) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verificar existencia y estado del servicio
        const [services] = await connection.query(
            'SELECT id, status FROM services WHERE id = ? FOR UPDATE',
            [serviceId]
        );

        if (services.length === 0) {
            const error = new Error('Servicio no encontrado');
            error.status = 404;
            throw error;
        }

        if (services[0].status === 'CANCELLED') {
            const error = new Error('No se pueden asignar repuestos a un servicio cancelado');
            error.status = 400;
            throw error;
        }

        // 2. Verificar y bloquear repuesto
        const [parts] = await connection.query(
            'SELECT id, name, stock, price FROM parts WHERE id = ? FOR UPDATE',
            [partId]
        );

        if (parts.length === 0) {
            const error = new Error('Repuesto no encontrado');
            error.status = 404;
            throw error;
        }

        const part = parts[0];
        const stockActual = Number(part.stock);
        const cantidadSolicitada = Number(quantity);

        if (cantidadSolicitada <= 0 || !Number.isInteger(cantidadSolicitada)) {
            const error = new Error('La cantidad debe ser un número entero mayor a 0');
            error.status = 400;
            throw error;
        }

        if (stockActual < cantidadSolicitada) {
            const error = new Error(`Stock insuficiente para "${part.name}". Stock disponible: ${stockActual}, solicitado: ${cantidadSolicitada}`);
            error.status = 400;
            throw error;
        }

        const nuevoStock = stockActual - cantidadSolicitada;

        // 3. Descontar del inventario
        await connection.query('UPDATE parts SET stock = ? WHERE id = ?', [nuevoStock, partId]);

        // 4. Registrar movimiento EXIT en part_movements
        await connection.query(`
            INSERT INTO part_movements (
                part_id,
                user_id,
                type,
                quantity,
                previous_stock,
                new_stock,
                reason
            )
            VALUES (?, ?, 'EXIT', ?, ?, ?, ?)
        `, [partId, userId || null, cantidadSolicitada, stockActual, nuevoStock, `Uso en orden de servicio #${serviceId}`]);

        // 5. Insertar o actualizar en service_parts
        const [existing] = await connection.query(
            'SELECT id, quantity FROM service_parts WHERE service_id = ? AND part_id = ?',
            [serviceId, partId]
        );

        let servicePartId;
        if (existing.length > 0) {
            const nuevaCantidadTotal = existing[0].quantity + cantidadSolicitada;
            await connection.query(
                'UPDATE service_parts SET quantity = ?, unit_price = ? WHERE id = ?',
                [nuevaCantidadTotal, part.price, existing[0].id]
            );
            servicePartId = existing[0].id;
        } else {
            const [insertResult] = await connection.query(`
                INSERT INTO service_parts (service_id, part_id, quantity, unit_price)
                VALUES (?, ?, ?, ?)
            `, [serviceId, partId, cantidadSolicitada, part.price]);
            servicePartId = insertResult.insertId;
        }

        await connection.commit();
        return servicePartId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

const removePartFromService = async (serviceId, servicePartId, userId) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verificar asignación en service_parts
        const [items] = await connection.query(`
            SELECT sp.id, sp.service_id, sp.part_id, sp.quantity, sp.unit_price, s.status AS serviceStatus
            FROM service_parts sp
            INNER JOIN services s ON sp.service_id = s.id
            WHERE sp.id = ? AND sp.service_id = ?
            FOR UPDATE
        `, [servicePartId, serviceId]);

        if (items.length === 0) {
            const error = new Error('El repuesto no está asignado a este servicio');
            error.status = 404;
            throw error;
        }

        const item = items[0];
        if (item.serviceStatus === 'CANCELLED') {
            const error = new Error('No se pueden modificar repuestos de un servicio cancelado');
            error.status = 400;
            throw error;
        }

        // 2. Bloquear repuesto para reponer stock
        const [parts] = await connection.query(
            'SELECT id, name, stock FROM parts WHERE id = ? FOR UPDATE',
            [item.part_id]
        );

        if (parts.length > 0) {
            const part = parts[0];
            const stockActual = Number(part.stock);
            const cantidadReintegrada = Number(item.quantity);
            const nuevoStock = stockActual + cantidadReintegrada;

            // Reintegrar al stock
            await connection.query('UPDATE parts SET stock = ? WHERE id = ?', [nuevoStock, item.part_id]);

            // Registrar movimiento ENTRY en part_movements
            await connection.query(`
                INSERT INTO part_movements (
                    part_id,
                    user_id,
                    type,
                    quantity,
                    previous_stock,
                    new_stock,
                    reason
                )
                VALUES (?, ?, 'ENTRY', ?, ?, ?, ?)
            `, [item.part_id, userId || null, cantidadReintegrada, stockActual, nuevoStock, `Reintegro por eliminación en orden de servicio #${serviceId}`]);
        }

        // 3. Eliminar de service_parts
        await connection.query('DELETE FROM service_parts WHERE id = ?', [servicePartId]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getAll,
    getById,
    getPartsByServiceId,
    create,
    update,
    updateStatus,
    motorcycleExists,
    addPartToService,
    removePartFromService
};