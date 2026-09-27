CREATE DATABASE IF NOT EXISTS taller_motos;
USE taller_motos;

-- Tabla de Roles
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Permisos del Sistema
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Intermedia Rol-Permisos
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Tabla de Usuarios
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

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Motocicletas
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

-- Tabla de Servicios
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

-- Tabla de Repuestos
CREATE TABLE IF NOT EXISTS parts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    stock INT DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de Finanzas (Deudas y Pagos)
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

-- Inserción de Permisos Iniciales
INSERT INTO permissions (name, description, module) VALUES
('manage_users', 'Crear, listar y administrar usuarios del sistema', 'Usuarios'),
('manage_roles', 'Crear, editar roles y configurar permisos', 'Roles'),
('manage_clients', 'Ver, registrar, editar y eliminar clientes', 'Clientes'),
('manage_motorcycles', 'Gestionar registro y ficha de motocicletas', 'Motocicletas'),
('manage_services', 'Gestionar órdenes de servicio y reparaciones', 'Servicios'),
('manage_parts', 'Administrar catálogo e inventario de repuestos', 'Repuestos'),
('manage_finances', 'Consultar y registrar deudas, abonos y pagos', 'Finanzas')
ON DUPLICATE KEY UPDATE description=VALUES(description), module=VALUES(module);

-- Inserción de Roles Base
INSERT INTO roles (id, name, description) VALUES
(1, 'Administrador', 'Control total administrativo y operativo del taller'),
(2, 'Mecánico', 'Acceso operativo a clientes, motocicletas, servicios y repuestos')
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- Asignación de Permisos a Rol Administrador (Todos los permisos)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- Asignación de Permisos a Rol Mecánico (Permisos operativos)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions 
WHERE name IN ('manage_clients', 'manage_motorcycles', 'manage_services', 'manage_parts');

-- Usuario Administrador por Defecto (Email: admin@taller.com / Password: password)
INSERT INTO users (id, name, email, password, role_id) 
VALUES (1, 'Administrador', 'admin@taller.com', '$2b$10$WcL1bPHsgdAeZ0XzbDeYvOXEulQSYNc5eT/knfw2uzGIDxJjqJ5Re', 1)
ON DUPLICATE KEY UPDATE email=VALUES(email), role_id=VALUES(role_id);
