const pool = require('../config/database');

const escaparComodines = (texto) => texto.replace(/[\\%_]/g, '\\$&');

/**
 * Resumen financiero global (KPIs).
 */
const getFinancialSummary = async () => {
    // 1. Total facturado y conteo de servicios no cancelados
    const [billedRows] = await pool.query(`
        SELECT
            COALESCE(SUM(s.cost + COALESCE(sp.parts_cost, 0)), 0) AS totalBilled,
            COUNT(s.id) AS totalServices
        FROM services s
        LEFT JOIN (
            SELECT service_id, SUM(quantity * unit_price) AS parts_cost
            FROM service_parts
            GROUP BY service_id
        ) sp ON sp.service_id = s.id
        WHERE s.status != 'CANCELLED'
    `);

    // 2. Total recaudado por pagos registrados
    const [collectedRows] = await pool.query(`
        SELECT
            COALESCE(SUM(amount), 0) AS totalCollected,
            COUNT(id) AS totalTransactions
        FROM debts_payments
        WHERE transaction_type = 'PAYMENT'
    `);

    // 3. Conteo de servicios por estado de cobro
    const [servicesRows] = await pool.query(`
        SELECT
            s.id,
            (s.cost + COALESCE(sp.parts_cost, 0)) AS totalAmount,
            COALESCE(dp.total_paid, 0) AS totalPaid
        FROM services s
        LEFT JOIN (
            SELECT service_id, SUM(quantity * unit_price) AS parts_cost
            FROM service_parts
            GROUP BY service_id
        ) sp ON sp.service_id = s.id
        LEFT JOIN (
            SELECT service_id, SUM(amount) AS total_paid
            FROM debts_payments
            WHERE transaction_type = 'PAYMENT'
            GROUP BY service_id
        ) dp ON dp.service_id = s.id
        WHERE s.status != 'CANCELLED'
    `);

    let paidCount = 0;
    let partialCount = 0;
    let pendingCount = 0;

    servicesRows.forEach((row) => {
        const total = parseFloat(row.totalAmount) || 0;
        const paid = parseFloat(row.totalPaid) || 0;

        if (total > 0 && paid >= total) {
            paidCount++;
        } else if (paid > 0 && paid < total) {
            partialCount++;
        } else {
            pendingCount++;
        }
    });

    const totalBilled = parseFloat(billedRows[0].totalBilled) || 0;
    const totalCollected = parseFloat(collectedRows[0].totalCollected) || 0;
    const totalPending = Math.max(0, totalBilled - totalCollected);

    return {
        totalBilled,
        totalCollected,
        totalPending,
        totalServices: parseInt(billedRows[0].totalServices, 10) || 0,
        totalTransactions: parseInt(collectedRows[0].totalTransactions, 10) || 0,
        countsByStatus: {
            paid: paidCount,
            partial: partialCount,
            pending: pendingCount
        }
    };
};

/**
 * Listado de órdenes de servicio con su estatus de pago y saldos.
 * Permite buscar por cliente, moto, placa o ID de orden.
 */
const getServicesPaymentStatus = async ({ search, paymentStatus }) => {
    let query = `
        SELECT
            s.id AS serviceId,
            s.description AS serviceDescription,
            s.status AS serviceStatus,
            s.created_at AS serviceCreatedAt,
            s.cost AS laborCost,
            COALESCE(sp.parts_cost, 0) AS partsCost,
            (s.cost + COALESCE(sp.parts_cost, 0)) AS totalAmount,
            COALESCE(dp.total_paid, 0) AS totalPaid,
            GREATEST(0, (s.cost + COALESCE(sp.parts_cost, 0)) - COALESCE(dp.total_paid, 0)) AS remainingBalance,

            c.id AS clientId,
            c.name AS clientName,
            c.phone AS clientPhone,

            m.brand AS motorcycleBrand,
            m.model AS motorcycleModel,
            m.license_plate AS licensePlate

        FROM services s
        INNER JOIN motorcycles m ON s.motorcycle_id = m.id
        INNER JOIN clients c ON m.client_id = c.id

        LEFT JOIN (
            SELECT service_id, SUM(quantity * unit_price) AS parts_cost
            FROM service_parts
            GROUP BY service_id
        ) sp ON sp.service_id = s.id

        LEFT JOIN (
            SELECT service_id, SUM(amount) AS total_paid
            FROM debts_payments
            WHERE transaction_type = 'PAYMENT'
            GROUP BY service_id
        ) dp ON dp.service_id = s.id

        WHERE s.status != 'CANCELLED'
    `;

    const params = [];

    if (search && search.trim()) {
        const pattern = `%${escaparComodines(search.trim())}%`;
        query += `
            AND (
                c.name LIKE ? OR
                c.phone LIKE ? OR
                m.license_plate LIKE ? OR
                m.brand LIKE ? OR
                m.model LIKE ? OR
                CAST(s.id AS CHAR) = ?
            )
        `;
        params.push(pattern, pattern, pattern, pattern, pattern, search.trim());
    }

    query += ` ORDER BY s.created_at DESC`;

    const [rows] = await pool.query(query, params);

    // Mapear el estatus de pago computado
    const services = rows.map((r) => {
        const total = parseFloat(r.totalAmount) || 0;
        const paid = parseFloat(r.totalPaid) || 0;
        const remaining = Math.max(0, total - paid);

        let status = 'PENDING';
        if (total > 0 && paid >= total) {
            status = 'PAID';
        } else if (paid > 0 && paid < total) {
            status = 'PARTIAL';
        }

        return {
            ...r,
            laborCost: parseFloat(r.laborCost) || 0,
            partsCost: parseFloat(r.partsCost) || 0,
            totalAmount: total,
            totalPaid: paid,
            remainingBalance: remaining,
            paymentStatus: status
        };
    });

    if (paymentStatus && ['PENDING', 'PARTIAL', 'PAID'].includes(paymentStatus.toUpperCase())) {
        return services.filter((s) => s.paymentStatus === paymentStatus.toUpperCase());
    }

    return services;
};

/**
 * Detalle financiero y desglose de pagos de una orden específica.
 */
const getServiceFinanceDetail = async (serviceId) => {
    const [rows] = await pool.query(`
        SELECT
            s.id AS serviceId,
            s.description AS serviceDescription,
            s.status AS serviceStatus,
            s.created_at AS serviceCreatedAt,
            s.cost AS laborCost,
            COALESCE(sp.parts_cost, 0) AS partsCost,
            (s.cost + COALESCE(sp.parts_cost, 0)) AS totalAmount,
            COALESCE(dp.total_paid, 0) AS totalPaid,
            GREATEST(0, (s.cost + COALESCE(sp.parts_cost, 0)) - COALESCE(dp.total_paid, 0)) AS remainingBalance,

            c.id AS clientId,
            c.name AS clientName,
            c.phone AS clientPhone,
            c.email AS clientEmail,

            m.brand AS motorcycleBrand,
            m.model AS motorcycleModel,
            m.license_plate AS licensePlate

        FROM services s
        INNER JOIN motorcycles m ON s.motorcycle_id = m.id
        INNER JOIN clients c ON m.client_id = c.id

        LEFT JOIN (
            SELECT service_id, SUM(quantity * unit_price) AS parts_cost
            FROM service_parts
            GROUP BY service_id
        ) sp ON sp.service_id = s.id

        LEFT JOIN (
            SELECT service_id, SUM(amount) AS total_paid
            FROM debts_payments
            WHERE transaction_type = 'PAYMENT'
            GROUP BY service_id
        ) dp ON dp.service_id = s.id

        WHERE s.id = ?
    `, [serviceId]);

    if (rows.length === 0) {
        return null;
    }

    const r = rows[0];
    const total = parseFloat(r.totalAmount) || 0;
    const paid = parseFloat(r.totalPaid) || 0;
    const remaining = Math.max(0, total - paid);

    let status = 'PENDING';
    if (total > 0 && paid >= total) {
        status = 'PAID';
    } else if (paid > 0 && paid < total) {
        status = 'PARTIAL';
    }

    // Consultar todos los pagos registrados para este servicio
    const [payments] = await pool.query(`
        SELECT
            id,
            amount,
            transaction_type AS transactionType,
            payment_method AS paymentMethod,
            notes,
            date,
            created_at AS createdAt
        FROM debts_payments
        WHERE service_id = ? AND transaction_type = 'PAYMENT'
        ORDER BY date DESC, id DESC
    `, [serviceId]);

    return {
        serviceId: r.serviceId,
        serviceDescription: r.serviceDescription,
        serviceStatus: r.serviceStatus,
        serviceCreatedAt: r.serviceCreatedAt,
        laborCost: parseFloat(r.laborCost) || 0,
        partsCost: parseFloat(r.partsCost) || 0,
        totalAmount: total,
        totalPaid: paid,
        remainingBalance: remaining,
        paymentStatus: status,
        client: {
            id: r.clientId,
            name: r.clientName,
            phone: r.clientPhone,
            email: r.clientEmail
        },
        motorcycle: {
            brand: r.motorcycleBrand,
            model: r.motorcycleModel,
            licensePlate: r.licensePlate
        },
        payments: payments.map((p) => ({
            ...p,
            amount: parseFloat(p.amount) || 0
        }))
    };
};

/**
 * Listado cronológico de transacciones generales.
 */
const getTransactions = async ({ search }) => {
    let query = `
        SELECT
            dp.id,
            dp.amount,
            dp.transaction_type AS transactionType,
            dp.payment_method AS paymentMethod,
            dp.notes,
            dp.date,
            dp.created_at AS createdAt,

            c.id AS clientId,
            c.name AS clientName,
            c.phone AS clientPhone,

            s.id AS serviceId,
            s.description AS serviceDescription,
            s.status AS serviceStatus,

            m.brand AS motorcycleBrand,
            m.model AS motorcycleModel,
            m.license_plate AS licensePlate

        FROM debts_payments dp
        INNER JOIN clients c ON dp.client_id = c.id
        LEFT JOIN services s ON dp.service_id = s.id
        LEFT JOIN motorcycles m ON s.motorcycle_id = m.id
    `;

    const params = [];

    if (search && search.trim()) {
        const pattern = `%${escaparComodines(search.trim())}%`;
        query += `
            WHERE (
                c.name LIKE ? OR
                c.phone LIKE ? OR
                m.license_plate LIKE ? OR
                dp.payment_method LIKE ? OR
                dp.notes LIKE ? OR
                CAST(dp.service_id AS CHAR) = ?
            )
        `;
        params.push(pattern, pattern, pattern, pattern, pattern, search.trim());
    }

    query += ` ORDER BY dp.date DESC, dp.id DESC`;

    const [rows] = await pool.query(query, params);

    return rows.map((r) => ({
        ...r,
        amount: parseFloat(r.amount) || 0
    }));
};

/**
 * Registra un pago atómicamente validando saldo restante.
 */
const createPayment = async ({ serviceId, amount, paymentMethod, notes }) => {
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Bloquear y verificar el servicio
        const [services] = await connection.query(`
            SELECT
                s.id,
                s.cost,
                s.status,
                s.motorcycle_id,
                m.client_id
            FROM services s
            INNER JOIN motorcycles m ON s.motorcycle_id = m.id
            WHERE s.id = ?
            FOR UPDATE
        `, [serviceId]);

        if (services.length === 0) {
            const error = new Error('Orden de servicio no encontrada');
            error.status = 404;
            throw error;
        }

        const service = services[0];

        if (service.status === 'CANCELLED') {
            const error = new Error('No se pueden registrar pagos a una orden cancelada');
            error.status = 400;
            throw error;
        }

        // 2. Calcular costo de repuestos
        const [partsCostRow] = await connection.query(`
            SELECT COALESCE(SUM(quantity * unit_price), 0) AS partsCost
            FROM service_parts
            WHERE service_id = ?
        `, [serviceId]);

        const laborCost = parseFloat(service.cost) || 0;
        const partsCost = parseFloat(partsCostRow[0].partsCost) || 0;
        const totalAmount = laborCost + partsCost;

        // 3. Calcular pagos ya realizados
        const [paidRow] = await connection.query(`
            SELECT COALESCE(SUM(amount), 0) AS totalPaid
            FROM debts_payments
            WHERE service_id = ? AND transaction_type = 'PAYMENT'
        `, [serviceId]);

        const totalPaid = parseFloat(paidRow[0].totalPaid) || 0;
        const remainingBalance = Math.max(0, totalAmount - totalPaid);

        const amountNum = parseFloat(amount);

        if (isNaN(amountNum) || amountNum <= 0) {
            const error = new Error('El monto a abonar debe ser mayor a 0');
            error.status = 400;
            throw error;
        }

        // Se permite una tolerancia de 0.01 por temas de redondeo decimal
        if (amountNum > remainingBalance + 0.01) {
            const error = new Error(
                `El monto (\$${amountNum.toFixed(2)}) supera el saldo pendiente (\$${remainingBalance.toFixed(2)})`
            );
            error.status = 400;
            throw error;
        }

        // 4. Insertar transacción en debts_payments
        const [insertResult] = await connection.query(`
            INSERT INTO debts_payments (
                client_id,
                service_id,
                amount,
                transaction_type,
                payment_method,
                notes,
                date
            )
            VALUES (?, ?, ?, 'PAYMENT', ?, ?, NOW())
        `, [
            service.client_id,
            serviceId,
            amountNum,
            paymentMethod || 'EFECTIVO',
            notes || null
        ]);

        await connection.commit();
        return insertResult.insertId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    getFinancialSummary,
    getServicesPaymentStatus,
    getServiceFinanceDetail,
    getTransactions,
    createPayment
};