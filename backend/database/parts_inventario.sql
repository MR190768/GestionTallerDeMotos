-- ====================================================================
-- MÓDULO DE INVENTARIO Y REPUESTOS - Migración
-- ====================================================================
-- Ejecutar DESPUÉS de init.sql. Es idempotente: se puede correr varias
-- veces sin duplicar columnas, índices ni tablas.
--
-- Qué hace:
--   1. Agrega a `parts` la columna `code` (código único del repuesto).
--   2. Agrega a `parts` la columna `min_stock` (umbral de alerta de bajo stock).
--   3. Crea la tabla `part_movements` (historial de entradas y salidas).
-- ====================================================================

USE taller_motos;

-- --------------------------------------------------------------------
-- 1. Columna `code` (se crea nullable, se rellenan los repuestos que ya
--    existían y luego se vuelve obligatoria y única)
-- --------------------------------------------------------------------
SET @existe_codigo := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'parts' AND COLUMN_NAME = 'code'
);
SET @sentencia := IF(@existe_codigo = 0,
    'ALTER TABLE parts ADD COLUMN code VARCHAR(50) NULL AFTER id',
    'SELECT 1');
PREPARE stmt FROM @sentencia;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Los repuestos anteriores a la migración reciben un código provisional (REP-0001, ...)
UPDATE parts SET code = CONCAT('REP-', LPAD(id, 4, '0')) WHERE code IS NULL OR code = '';

ALTER TABLE parts MODIFY COLUMN code VARCHAR(50) NOT NULL;

SET @existe_indice := (
    SELECT COUNT(*) FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'parts' AND INDEX_NAME = 'uq_parts_code'
);
SET @sentencia := IF(@existe_indice = 0,
    'ALTER TABLE parts ADD UNIQUE INDEX uq_parts_code (code)',
    'SELECT 1');
PREPARE stmt FROM @sentencia;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- --------------------------------------------------------------------
-- 2. Columna `min_stock` (stock mínimo para la alerta de bajo stock)
-- --------------------------------------------------------------------
SET @existe_minimo := (
    SELECT COUNT(*) FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'parts' AND COLUMN_NAME = 'min_stock'
);
SET @sentencia := IF(@existe_minimo = 0,
    'ALTER TABLE parts ADD COLUMN min_stock INT NOT NULL DEFAULT 10 AFTER stock',
    'SELECT 1');
PREPARE stmt FROM @sentencia;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- El stock nunca debe ser nulo
UPDATE parts SET stock = 0 WHERE stock IS NULL;
ALTER TABLE parts MODIFY COLUMN stock INT NOT NULL DEFAULT 0;

-- --------------------------------------------------------------------
-- 3. Historial de movimientos de inventario
--    type: ENTRY = entrada (suma stock) | EXIT = salida (resta stock)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS part_movements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT NOT NULL,
    user_id INT NULL,
    type ENUM('ENTRY', 'EXIT') NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
