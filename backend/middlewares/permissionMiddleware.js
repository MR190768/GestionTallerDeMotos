/**
 * Middleware para validar permisos granulares basados en RBAC.
 * Permite acceso si el usuario es Administrador (ID: 1 o nombre)
 * o si posee el permiso requerido en su token de sesión.
 */
module.exports = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        // El Administrador principal siempre tiene acceso total
        const isAdmin = req.user.roleId === 1 || 
                        req.user.role?.toLowerCase() === 'administrador' || 
                        req.user.role?.toLowerCase() === 'admin';

        if (isAdmin) {
            return next();
        }

        const userPermissions = Array.isArray(req.user.permissions) ? req.user.permissions : [];

        // Si se pasa un array de permisos (basta con tener uno) o un string único
        const hasPermission = Array.isArray(requiredPermission)
            ? requiredPermission.some(perm => userPermissions.includes(perm))
            : userPermissions.includes(requiredPermission);

        if (!hasPermission) {
            return res.status(403).json({ 
                error: 'Acceso denegado: no cuentas con los permisos requeridos para esta acción' 
            });
        }

        next();
    };
};
