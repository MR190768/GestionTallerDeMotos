-- ====================================================================
-- SISTEMA DE GESTIÓN PARA TALLER DE MOTOCICLETAS
-- Script Único y Completo de Inicialización de Base de Datos (init.sql)
-- Incluye: RBAC dinámico, Clientes, Motocicletas, Órdenes de Servicio,
--          Inventario/Repuestos con Historial de Movimientos y Finanzas.
-- ====================================================================

SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS taller_motos;
USE taller_motos;

-- --------------------------------------------------------------------
-- 1. Tabla de Roles (RBAC Dinámico)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. Tabla de Permisos del Sistema
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 3. Tabla Intermedia Rol - Permisos (Relación N:M)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 4. Tabla de Usuarios del Sistema
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- --------------------------------------------------------------------
-- 5. Tabla de Clientes
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 6. Tabla de Motocicletas
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS motorcycles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT,
    license_plate VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 7. Tabla de Órdenes de Servicio
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    motorcycle_id INT NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (motorcycle_id) REFERENCES motorcycles(id) ON DELETE CASCADE
);

-- --------------------------------------------------------------------
-- 8. Tabla de Repuestos e Inventario
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stock INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 10,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Migración idónea en caso de que la tabla 'parts' haya sido creada en versiones previas sin 'code' o 'min_stock'
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

UPDATE parts SET code = CONCAT('REP-', LPAD(id, 4, '0')) WHERE code IS NULL OR code = '';

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

-- --------------------------------------------------------------------
-- 9. Tabla de Movimientos de Inventario (Historial de Entradas y Salidas)
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

-- --------------------------------------------------------------------
-- 10. Tabla Intermedia Servicio - Repuestos (service_parts)
-- Relación 1 a muchos: Un servicio puede usar múltiples partes
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS service_parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (part_id) REFERENCES parts(id) ON DELETE RESTRICT
);

-- --------------------------------------------------------------------
-- 11. Tabla de Finanzas (Deudas y Pagos)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS debts_payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    service_id INT,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type ENUM('DEBT', 'PAYMENT') NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
);

-- ====================================================================
-- DATOS INICIALES (SEEDS)
-- ====================================================================

-- 1. Catálogo Completo de Permisos
INSERT INTO permissions (name, description, module) VALUES
('manage_users', 'Crear, listar y administrar usuarios del sistema', 'Usuarios'),
('manage_roles', 'Crear, editar roles y configurar permisos', 'Roles'),
('manage_clients', 'Ver, registrar, editar y eliminar clientes', 'Clientes'),
('manage_motorcycles', 'Gestionar registro y ficha de motocicletas', 'Motocicletas'),
('manage_services', 'Gestionar órdenes de servicio y reparaciones', 'Servicios'),
('manage_parts', 'Administrar catálogo e inventario de repuestos', 'Repuestos'),
('manage_finances', 'Consultar y registrar deudas, abonos y pagos', 'Finanzas')
ON DUPLICATE KEY UPDATE description=VALUES(description), module=VALUES(module);

-- 2. Roles Base del Sistema
INSERT INTO roles (id, name, description) VALUES
(1, 'Administrador', 'Control total administrativo y operativo del taller'),
(2, 'Mecánico', 'Acceso operativo a clientes, motocicletas, servicios y repuestos')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 3. Asignación de Permisos al Rol Administrador (Todos los 7 permisos)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- 4. Asignación de Permisos al Rol Mecánico (Permisos de operación en taller)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions 
WHERE name IN ('manage_clients', 'manage_motorcycles', 'manage_services', 'manage_parts');

-- 5. Usuario Administrador por Defecto
-- Credenciales: admin@taller.com / password
INSERT INTO users (id, name, email, password, role_id) 
VALUES (1, 'Administrador', 'admin@taller.com', '$2b$10$WcL1bPHsgdAeZ0XzbDeYvOXEulQSYNc5eT/knfw2uzGIDxJjqJ5Re', 1)
ON DUPLICATE KEY UPDATE email=VALUES(email), role_id=VALUES(role_id);

-- 6. Catálogo Inicial de Repuestos de Ejemplo
INSERT IGNORE INTO parts (code, name, description, stock, min_stock, price) VALUES
('AC-102', 'Aceite 20W50', 'Aceite de motor 20W50 para motos de 4 tiempos', 18, 10, 8.50),
('FR-045', 'Pastillas de freno', 'Juego de pastillas de freno delanteras', 2, 10, 12.00),
('BT-210', 'Batería 12V', 'Batería sellada de 12V', 5, 10, 45.00),
('BJ-330', 'Bujía estándar', 'Bujía estándar de encendido', 24, 10, 3.25);
