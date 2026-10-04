const partsService = require('../services/parts.service');

// GET /api/parts?busqueda=texto  → Lista el catálogo (con búsqueda opcional por código o nombre)
const listarRepuestos = async (req, res, next) => {
    try {
        const { busqueda } = req.query;

        const repuestos = await partsService.listarRepuestos(busqueda);

        res.status(200).json(repuestos);
    } catch (error) {
        next(error);
    }
};

// GET /api/parts/:id  → Detalle de un repuesto
const obtenerRepuestoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const repuesto = await partsService.obtenerRepuestoPorId(id);

        res.status(200).json(repuesto);
    } catch (error) {
        next(error);
    }
};

// POST /api/parts  → Crea un repuesto
const crearRepuesto = async (req, res, next) => {
    try {
        const repuesto = await partsService.crearRepuesto(req.body, req.user.id);

        res.status(201).json(repuesto);
    } catch (error) {
        next(error);
    }
};

// PUT /api/parts/:id  → Actualiza precio, stock y demás datos
const actualizarRepuesto = async (req, res, next) => {
    try {
        const { id } = req.params;

        const repuesto = await partsService.actualizarRepuesto(id, req.body, req.user.id);

        res.status(200).json(repuesto);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/parts/:id  → Elimina un repuesto
const eliminarRepuesto = async (req, res, next) => {
    try {
        const { id } = req.params;

        await partsService.eliminarRepuesto(id);

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// POST /api/parts/movement  → Registra una entrada o salida de stock
const registrarMovimiento = async (req, res, next) => {
    try {
        const resultado = await partsService.registrarMovimiento(req.body, req.user.id);

        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
};

// GET /api/parts/history/services  → Lista el historial de repuestos usados en servicios
const obtenerHistorialEnServicios = async (req, res, next) => {
    try {
        const { busqueda, partId } = req.query;
        const historial = await partsService.obtenerHistorialEnServicios(busqueda, partId);

        res.json(historial);
    } catch (error) {
        next(error);
    }
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

