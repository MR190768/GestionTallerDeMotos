const pool = require('../config/database');

const getAll = async () => {
    const [rows] = await pool.query(`
        SELECT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.address,
            c.created_at AS createdAt,
            c.updated_at AS updatedAt,

            COALESCE(service_counts.serviceCount, 0) AS serviceCount,

            COALESCE(debt_balances.debt, 0) AS debt

        FROM clients c

        LEFT JOIN (
            SELECT
                m.client_id,
                SUM(
                    CASE
                        WHEN s.status IN ('PENDING', 'IN_PROGRESS')
                        THEN 1
                        ELSE 0
                    END
                    ) AS serviceCount
            FROM motorcycles m
            LEFT JOIN services s
                ON s.motorcycle_id = m.id
            GROUP BY m.client_id
        ) AS service_counts
            ON service_counts.client_id = c.id

        LEFT JOIN (
            SELECT
                client_id,
                GREATEST(
                    SUM(
                        CASE
                            WHEN transaction_type = 'DEBT'
                            THEN amount
                            ELSE 0
                        END
                    )
                    -
                    SUM(
                        CASE
                            WHEN transaction_type = 'PAYMENT'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS debt
            FROM debts_payments
            GROUP BY client_id
        ) AS debt_balances
            ON debt_balances.client_id = c.id

        ORDER BY c.created_at DESC
    `);

    return rows;
};

const getById = async (id) => {
    const [rows] = await pool.query(`
        SELECT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.address,
            c.created_at AS createdAt,
            c.updated_at AS updatedAt,

            COALESCE(service_counts.serviceCount, 0) AS serviceCount,

            COALESCE(debt_balances.debt, 0) AS debt

        FROM clients c

        LEFT JOIN (
            SELECT
                m.client_id,
                SUM(
                    CASE
                        WHEN s.status IN ('PENDING', 'IN_PROGRESS')
                        THEN 1
                        ELSE 0
                    END
                    ) AS serviceCount
            FROM motorcycles m
            LEFT JOIN services s
                ON s.motorcycle_id = m.id
            GROUP BY m.client_id
        ) AS service_counts
            ON service_counts.client_id = c.id

        LEFT JOIN (
            SELECT
                client_id,
                GREATEST(
                    SUM(
                        CASE
                            WHEN transaction_type = 'DEBT'
                            THEN amount
                            ELSE 0
                        END
                    )
                    -
                    SUM(
                        CASE
                            WHEN transaction_type = 'PAYMENT'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS debt
            FROM debts_payments
            GROUP BY client_id
        ) AS debt_balances
            ON debt_balances.client_id = c.id

        WHERE c.id = ?
    `, [id]);

    return rows[0];
};

const search = async (query) => {
    const [rows] = await pool.query(`
        SELECT
            c.id,
            c.name,
            c.email,
            c.phone,
            c.address,
            c.created_at AS createdAt,
            c.updated_at AS updatedAt,

            COALESCE(service_counts.serviceCount, 0) AS serviceCount,

            COALESCE(debt_balances.debt, 0) AS debt

        FROM clients c

        LEFT JOIN (
            SELECT
                m.client_id,
                COUNT(s.id) AS serviceCount
            FROM motorcycles m
            LEFT JOIN services s
                ON s.motorcycle_id = m.id
            GROUP BY m.client_id
        ) AS service_counts
            ON service_counts.client_id = c.id

        LEFT JOIN (
            SELECT
                client_id,
                GREATEST(
                    SUM(
                        CASE
                            WHEN transaction_type = 'DEBT'
                            THEN amount
                            ELSE 0
                        END
                    )
                    -
                    SUM(
                        CASE
                            WHEN transaction_type = 'PAYMENT'
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS debt
            FROM debts_payments
            GROUP BY client_id
        ) AS debt_balances
            ON debt_balances.client_id = c.id

        WHERE
            c.name LIKE ?
            OR c.email LIKE ?
            OR c.phone LIKE ?
            OR c.address LIKE ?

        ORDER BY c.name ASC
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