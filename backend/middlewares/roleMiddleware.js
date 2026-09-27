module.exports = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }

        const userRole = (req.user.role || '').toLowerCase();
        const userRoleId = req.user.roleId;

        // Normalizar roles permitidos a minúsculas
        const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

        // Administrador por ID o alias
        if (userRoleId === 1 || userRole === 'admin' || userRole === 'administrador') {
            if (normalizedAllowed.includes('admin') || normalizedAllowed.includes('administrador')) {
                return next();
            }
        }

        // Mecánico
        if (userRole === 'mecanico' || userRole === 'mecánico') {
            if (normalizedAllowed.includes('mecanico') || normalizedAllowed.includes('mecánico')) {
                return next();
            }
        }

        // Coincidencia directa
        if (normalizedAllowed.includes(userRole)) {
            return next();
        }

        return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' });
    };
};