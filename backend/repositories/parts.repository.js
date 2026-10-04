const pool = require('../config/database');

// Columnas que se devuelven de un repuesto (con alias en camelCase, igual que clients.repository)
const COLUMNAS_REPUESTO = `
    id,
    code,
    name,
    description,
    stock,
    min_stock AS minStock,
    price,
    created_at AS createdAt,
    updated_at AS updatedAt
`;

// Escapa los comodines de LIKE para que "%" o "_" escritos por el usuario se busquen literalmente
const escaparComodines = (texto) => texto.replace(/[\\%_]/g, '\\$&');

/**
 * Inserta una fila en el historial de movimientos.
 * Recibe la conexión activa para poder participar dentro de una transacción.
 */
const insertarMovimiento = async (conexion, { idRepuesto, idUsuario, tipo, cantidad, stockAnterior, stockNuevo, motivo }) => {
    const [resultado] = await conexion.query(`
        INSERT INTO part_movements (
            part_id,
            user_id,
            type,
            quantity,
            previous_stock,
            new_stock,
            reason
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [idRepuesto, idUsuario || null, tipo, cantidad, stockAnterior, stockNuevo, motivo || null]);

    return resultado.insertId;
};

/**
 * Lista el catálogo. Si llega `busqueda`, filtra por código o nombre.
 */
const listar = async (busqueda) => {
    let consulta = `SELECT ${COLUMNAS_REPUESTO} FROM parts`;
    const parametros = [];

    if (busqueda) {
        const patron = `%${escaparComodines(busqueda)}%`;
        consulta += ' WHERE code LIKE ? OR name LIKE ?';
        parametros.push(patron, patron);
    }

    consulta += ' ORDER BY name ASC';

    const [filas] = await pool.query(consulta, parametros);
    return filas;
};

const obtenerPorId = async (id) => {
    const [filas] = await pool.query(
        `SELECT ${COLUMNAS_REPUESTO} FROM parts WHERE id = ?`,
        [id]
    );

    return filas[0] || null;
};

const obtenerPorCodigo = async (codigo) => {
    const [filas] = await pool.query(
        `SELECT ${COLUMNAS_REPUESTO} FROM parts WHERE code = ?`,
        [codigo]
    );

    return filas[0] || null;
};

/**
 * Crea un repuesto. Si nace con stock mayor a 0, registra la entrada inicial
 * en el historial dentro de la misma transacción.
 * Devuelve el id del repuesto creado.
 */
const crear = async (datos, idUsuario) => {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        const [resultado] = await conexion.query(`
            INSERT INTO parts (code, name, description, stock, min_stock, price)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [datos.code, datos.name, datos.description, datos.stock, datos.minStock, datos.price]);

        if (datos.stock > 0) {
            await insertarMovimiento(conexion, {
                idRepuesto: resultado.insertId,
                idUsuario,
                tipo: 'ENTRY',
                cantidad: datos.stock,
                stockAnterior: 0,
                stockNuevo: datos.stock,
                motivo: 'Stock inicial'
            });
        }

        await conexion.commit();
        return resultado.insertId;
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
};

/**
 * Actualiza los datos de un repuesto. Si el stock cambió, deja constancia en
 * el historial como un ajuste manual (entrada o salida por la diferencia),
 * para que el historial siempre cuadre con el stock real.
 * Devuelve la cantidad de filas afectadas (0 si el repuesto no existe).
 */
const actualizar = async (id, datos, idUsuario) => {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        // Se bloquea la fila para leer el stock actual sin que otro movimiento lo cambie en medio
        const [filas] = await conexion.query('SELECT stock FROM parts WHERE id = ? FOR UPDATE', [id]);

        if (filas.length === 0) {
            await conexion.rollback();
            return 0;
        }

        const stockAnterior = filas[0].stock;

        const [resultado] = await conexion.query(`
            UPDATE parts
            SET
                code = ?,
                name = ?,
                description = ?,
                stock = ?,
                min_stock = ?,
                price = ?
            WHERE id = ?
        `, [datos.code, datos.name, datos.description, datos.stock, datos.minStock, datos.price, id]);

        if (datos.stock !== stockAnterior) {
            await insertarMovimiento(conexion, {
                idRepuesto: id,
                idUsuario,
                tipo: datos.stock > stockAnterior ? 'ENTRY' : 'EXIT',
                cantidad: Math.abs(datos.stock - stockAnterior),
                stockAnterior,
                stockNuevo: datos.stock,
                motivo: 'Ajuste manual de stock'
            });
        }

        await conexion.commit();
        return resultado.affectedRows;
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
};

const eliminar = async (id) => {
    const [resultado] = await pool.query('DELETE FROM parts WHERE id = ?', [id]);
    return resultado.affectedRows;
};

/**
 * Aplica una entrada o salida de forma atómica.
 * Retorna:
 *  - null                                  → el repuesto no existe
 *  - { stockInsuficiente: true, stockActual } → la salida pide más de lo disponible (no se modifica nada)
 *  - { stockAnterior, stockNuevo, idMovimiento } → movimiento aplicado
 */
const registrarMovimiento = async (idRepuesto, tipo, cantidad, motivo, idUsuario) => {
    const conexion = await pool.getConnection();

    try {
        await conexion.beginTransaction();

        // Bloqueo de fila: dos salidas simultáneas no pueden dejar el stock en negativo
        const [filas] = await conexion.query('SELECT stock FROM parts WHERE id = ? FOR UPDATE', [idRepuesto]);

        if (filas.length === 0) {
            await conexion.rollback();
            return null;
        }

        const stockAnterior = filas[0].stock;
        const stockNuevo = tipo === 'ENTRY' ? stockAnterior + cantidad : stockAnterior - cantidad;

        if (stockNuevo < 0) {
            await conexion.rollback();
            return { stockInsuficiente: true, stockActual: stockAnterior };
        }

        await conexion.query('UPDATE parts SET stock = ? WHERE id = ?', [stockNuevo, idRepuesto]);

        const idMovimiento = await insertarMovimiento(conexion, {
            idRepuesto,
            idUsuario,
            tipo,
            cantidad,
            stockAnterior,
            stockNuevo,
            motivo
        });

        await conexion.commit();
        return { stockAnterior, stockNuevo, idMovimiento };
    } catch (error) {
        await conexion.rollback();
        throw error;
    } finally {
        conexion.release();
    }
};

/**
 * Obtiene el historial de repuestos utilizados en órdenes de servicio.
 * Permite filtrar por texto de búsqueda (código/nombre de repuesto, placa de moto o nombre de cliente)
 * o por un ID de repuesto específico.
 */
const obtenerHistorialEnServicios = async (busqueda, partId) => {
    let consulta = `
        SELECT
            sp.id,
            sp.service_id AS serviceId,
            sp.part_id AS partId,
            sp.quantity,
            sp.unit_price AS unitPrice,
            (sp.quantity * sp.unit_price) AS subtotal,
            sp.created_at AS dateUsed,
            p.code AS partCode,
            p.name AS partName,
            s.status AS serviceStatus,
            s.description AS serviceDescription,
            m.brand AS motorcycleBrand,
            m.model AS motorcycleModel,
            m.license_plate AS licensePlate,
            c.name AS clientName,
            c.phone AS clientPhone
        FROM service_parts sp
        INNER JOIN parts p ON sp.part_id = p.id
        INNER JOIN services s ON sp.service_id = s.id
        INNER JOIN motorcycles m ON s.motorcycle_id = m.id
        INNER JOIN clients c ON m.client_id = c.id
    `;

    const condiciones = [];
    const parametros = [];

    if (partId) {
        condiciones.push('sp.part_id = ?');
        parametros.push(partId);
    }

    if (busqueda && busqueda.trim()) {
        const patron = `%${escaparComodines(busqueda.trim())}%`;
        condiciones.push('(p.code LIKE ? OR p.name LIKE ? OR m.license_plate LIKE ? OR c.name LIKE ?)');
        parametros.push(patron, patron, patron, patron);
    }

    if (condiciones.length > 0) {
        consulta += ` WHERE ${condiciones.join(' AND ')}`;
    }

    consulta += ' ORDER BY sp.created_at DESC, sp.id DESC';

    const [filas] = await pool.query(consulta, parametros);
    return filas;
};

module.exports = {
    listar,
    obtenerPorId,
    obtenerPorCodigo,
    crear,
    actualizar,
    eliminar,
    registrarMovimiento,
    obtenerHistorialEnServicios
};

