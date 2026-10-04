const { Router } = require('express');
const partsController = require('../controllers/parts.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const permissionMiddleware = require('../middlewares/permissionMiddleware');
const router = Router();

router.use(authMiddleware);

// Requiere el permiso 'manage_parts' (el Administrador siempre tiene acceso)
router.use(permissionMiddleware('manage_parts'));

// Listar catálogo (admite ?busqueda= para buscar por código o nombre)
router.get('/', partsController.listarRepuestos);

// Registrar entrada o salida de stock
router.post('/movement', partsController.registrarMovimiento);

// Historial de repuestos utilizados en órdenes de servicio
router.get('/history/services', partsController.obtenerHistorialEnServicios);

// Detalle de un repuesto
router.get('/:id', partsController.obtenerRepuestoPorId);

// Crear repuesto
router.post('/', partsController.crearRepuesto);

// Actualizar precio/stock y demás datos
router.put('/:id', partsController.actualizarRepuesto);

// Eliminar repuesto
router.delete('/:id', partsController.eliminarRepuesto);

module.exports = router;
