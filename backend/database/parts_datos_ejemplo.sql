-- ====================================================================
-- DATOS DE EJEMPLO (OPCIONAL) - Inventario y Repuestos
-- ====================================================================
-- Ejecutar después de parts_inventario.sql. Carga los repuestos que
-- aparecen en el mockup 4_Inventario.png. Los precios son ilustrativos.
-- Usa INSERT IGNORE: si el código ya existe, no se duplica.
-- ====================================================================

-- Fuerza UTF-8 en esta sesión para que los acentos (Batería, Bujía...) se guarden bien
SET NAMES utf8mb4;

USE taller_motos;

INSERT IGNORE INTO parts (code, name, description, stock, min_stock, price) VALUES
('AC-102', 'Aceite 20W50', 'Aceite de motor 20W50 para motos de 4 tiempos', 18, 10, 8.50),
('FR-045', 'Pastillas de freno', 'Juego de pastillas de freno delanteras', 2, 10, 12.00),
('BT-210', 'Batería 12V', 'Batería sellada de 12V', 5, 10, 45.00),
('BJ-330', 'Bujía estándar', 'Bujía estándar de encendido', 24, 10, 3.25);
