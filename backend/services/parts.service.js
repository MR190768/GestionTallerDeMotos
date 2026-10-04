const partsRepository = require('../repositories/parts.repository');

// ====================================================================
// Constantes de negocio
// ====================================================================
const TIPOS_MOVIMIENTO = ['ENTRY', 'EXIT'];
const STOCK_MINIMO_POR_DEFECTO = 10;
const MAXIMO_ENTERO = 1000000;      // Tope razonable para stock y cantidades
const MAXIMO_PRECIO = 99999999.99;  // Límite de DECIMAL(10, 2)
const FORMATO_CODIGO = /^[A-Z0-9._-]+$/;

// ====================================================================
// Utilidades internas
// ====================================================================

// Lanza un error con código HTTP; lo procesa el errorMiddleware global
const lanzarError = (mensaje, estado) => {
    const error = new Error(mensaje);
    error.status = estado;
    throw error;
};

const esEnteroNoNegativo = (valor) => Number.isInteger(valor) && valor >= 0 && valor <= MAXIMO_ENTERO;

// Convierte un valor recibido (número o texto) a número; si viene vacío/undefined devuelve undefined
const convertirANumero = (valor) => {
    if (valor === undefined || valor === null || valor === '') {
        return undefined;
    }
    return Number(valor);
};

const validarId = (id) => {
    const idNumerico = Number(id);

    if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
        lanzarError('El identificador del repuesto no es válido', 400);
    }

    return idNumerico;
};

/**
 * Regla de negocio de la alerta de bajo stock:
 *  - CRITICAL: agotado, o por debajo de la mitad del mínimo
 *  - LOW:      igual o por debajo del mínimo
 *  - OK:       stock suficiente
 */
const calcularEstadoStock = (stock, minStock) => {
    if (stock === 0 || stock * 2 < minStock) {
        return 'CRITICAL';
    }

    if (stock <= minStock) {
        return 'LOW';
    }

    return 'OK';
};

// Convierte una fila de la BD al formato que consume el frontend
const formatearRepuesto = (repuesto) => {
    const stock = Number(repuesto.stock);
    const minStock = Number(repuesto.minStock);

    return {
        ...repuesto,
        stock,
        minStock,
        price: Number(repuesto.price),
        stockStatus: calcularEstadoStock(stock, minStock)
    };
};

/**
 * Valida y normaliza los datos de un repuesto (crear / editar).
 * Devuelve un objeto limpio listo para persistir.
 */
const validarDatosRepuesto = (datos) => {
    const codigo = typeof datos.code === 'string' ? datos.code.trim().toUpperCase() : '';
    const nombre = typeof datos.name === 'string' ? datos.name.trim() : '';
    const descripcion = typeof datos.description === 'string' ? datos.description.trim() : '';

    if (!codigo) {
        lanzarError('El código es obligatorio', 400);
    }

    if (codigo.length > 50 || !FORMATO_CODIGO.test(codigo)) {
        lanzarError('El código solo puede tener letras, números, puntos, guiones y guiones bajos (máximo 50 caracteres)', 400);
    }

    if (!nombre) {
        lanzarError('El nombre es obligatorio', 400);
    }

    if (nombre.length > 100) {
        lanzarError('El nombre no puede superar los 100 caracteres', 400);
    }

    const precio = Number(datos.price);

    if (datos.price === undefined || datos.price === null || datos.price === '' || Number.isNaN(precio) || precio <= 0 || precio > MAXIMO_PRECIO) {
        lanzarError('El precio debe ser un número mayor a 0', 400);
    }

    if (!esEnteroNoNegativo(datos.stock)) {
        lanzarError('El stock debe ser un número entero mayor o igual a 0', 400);
    }

    if (!esEnteroNoNegativo(datos.minStock)) {
        lanzarError('El stock mínimo debe ser un número entero mayor o igual a 0', 400);
    }

    return {
        code: codigo,
        name: nombre,
        description: descripcion || null,
        price: Math.round(precio * 100) / 100,
        stock: datos.stock,
        minStock: datos.minStock
    };
};

// Traduce el error de código duplicado de MySQL a un error de negocio 409
const traducirErrorDuplicado = (error) => {
    if (error.code === 'ER_DUP_ENTRY') {
        lanzarError('Ya existe un repuesto con ese código', 409);
    }
    throw error;
};

// ====================================================================
// Casos de uso
// ====================================================================

const listarRepuestos = async (busqueda) => {
    const texto = typeof busqueda === 'string' ? busqueda.trim() : '';
    const repuestos = await partsRepository.listar(texto);

    return repuestos.map(formatearRepuesto);
};

const obtenerRepuestoPorId = async (id) => {
    const repuesto = await partsRepository.obtenerPorId(validarId(id));

    if (!repuesto) {
        lanzarError('Repuesto no encontrado', 404);
    }

    return formatearRepuesto(repuesto);
};

const crearRepuesto = async (datos, idUsuario) => {
    const datosLimpios = validarDatosRepuesto({
        ...datos,
        stock: convertirANumero(datos.stock) ?? 0,
        minStock: convertirANumero(datos.minStock) ?? STOCK_MINIMO_POR_DEFECTO
    });

    const repuestoExistente = await partsRepository.obtenerPorCodigo(datosLimpios.code);

    if (repuestoExistente) {
        lanzarError('Ya existe un repuesto con ese código', 409);
    }

    try {
        const idNuevo = await partsRepository.crear(datosLimpios, idUsuario);
        return await obtenerRepuestoPorId(idNuevo);
    } catch (error) {
        traducirErrorDuplicado(error);
    }
};

/**
 * Actualiza precio, stock y demás datos. Los campos que no se envían
 * conservan su valor actual (así se puede mandar solo { price } o solo { stock }).
 */
const actualizarRepuesto = async (id, datos, idUsuario) => {
    const idNumerico = validarId(id);
    const repuestoActual = await partsRepository.obtenerPorId(idNumerico);

    if (!repuestoActual) {
        lanzarError('Repuesto no encontrado', 404);
    }

    const datosLimpios = validarDatosRepuesto({
        code: datos.code ?? repuestoActual.code,
        name: datos.name ?? repuestoActual.name,
        description: datos.description ?? repuestoActual.description,
        price: datos.price ?? repuestoActual.price,
        stock: convertirANumero(datos.stock) ?? Number(repuestoActual.stock),
        minStock: convertirANumero(datos.minStock) ?? Number(repuestoActual.minStock)
    });

    const repuestoConMismoCodigo = await partsRepository.obtenerPorCodigo(datosLimpios.code);

    if (repuestoConMismoCodigo && repuestoConMismoCodigo.id !== idNumerico) {
        lanzarError('Ya existe otro repuesto con ese código', 409);
    }

    try {
        await partsRepository.actualizar(idNumerico, datosLimpios, idUsuario);
    } catch (error) {
        traducirErrorDuplicado(error);
    }

    return await obtenerRepuestoPorId(idNumerico);
};

const eliminarRepuesto = async (id) => {
    const idNumerico = validarId(id);

    await obtenerRepuestoPorId(idNumerico);
    try {
        await partsRepository.eliminar(idNumerico);
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            lanzarError('No se puede eliminar el repuesto porque ya ha sido utilizado en órdenes de servicio', 409);
        }
        throw error;
    }
};

/**
 * Registra una entrada (compra/reposición) o salida (uso/venta) de stock.
 * datos: { partId, type: 'ENTRY' | 'EXIT', quantity, reason? }
 */
const registrarMovimiento = async (datos, idUsuario) => {
    const idRepuesto = validarId(datos.partId);
    const tipo = typeof datos.type === 'string' ? datos.type.trim().toUpperCase() : '';
    const cantidad = convertirANumero(datos.quantity);
    const motivo = typeof datos.reason === 'string' ? datos.reason.trim() : '';

    if (!TIPOS_MOVIMIENTO.includes(tipo)) {
        lanzarError("El tipo de movimiento debe ser 'ENTRY' (entrada) o 'EXIT' (salida)", 400);
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > MAXIMO_ENTERO) {
        lanzarError('La cantidad debe ser un número entero mayor a 0', 400);
    }

    if (motivo.length > 255) {
        lanzarError('El motivo no puede superar los 255 caracteres', 400);
    }

    const resultado = await partsRepository.registrarMovimiento(idRepuesto, tipo, cantidad, motivo || null, idUsuario);

    if (resultado === null) {
        lanzarError('Repuesto no encontrado', 404);
    }

    if (resultado.stockInsuficiente) {
        lanzarError(`Stock insuficiente: solo hay ${resultado.stockActual} unidades disponibles`, 400);
    }

    return {
        repuesto: await obtenerRepuestoPorId(idRepuesto),
        movimiento: {
            id: resultado.idMovimiento,
            partId: idRepuesto,
            type: tipo,
            quantity: cantidad,
            previousStock: resultado.stockAnterior,
            newStock: resultado.stockNuevo,
            reason: motivo || null
        }
    };
};

const obtenerHistorialEnServicios = async (busqueda, partId) => {
    let idNumerico = null;
    if (partId) {
        idNumerico = validarId(partId);
    }
    return await partsRepository.obtenerHistorialEnServicios(busqueda, idNumerico);
};

module.exports = {
    listarRepuestos,
    obtenerRepuestoPorId,
    crearRepuesto,
    actualizarRepuesto,
    eliminarRepuesto,
    registrarMovimiento,
    obtenerHistorialEnServicios
};

