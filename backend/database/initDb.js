const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = require('../config/database');

async function initializeDatabase() {
    console.log('🔄 Iniciando configuración de base de datos...');
    
    try {
        const sqlFilePath = path.join(__dirname, 'init.sql');
        let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

        // Si ya estamos conectados a una base de datos específica (como en Railway, ej: 'railway'),
        // removemos las directivas que fuerzan la creación y uso de 'taller_motos' para no causar conflictos.
        const targetDb = process.env.DB_NAME || process.env.MYSQLDATABASE;
        if (targetDb && targetDb !== 'taller_motos') {
            console.log(`ℹ️ Base de datos detectada: "${targetDb}". Adaptando sentencias CREATE DATABASE y USE...`);
            sqlContent = sqlContent
                .replace(/CREATE DATABASE IF NOT EXISTS\s+`?taller_motos`?;?/gi, '')
                .replace(/USE\s+`?taller_motos`?;?/gi, '');
        }

        console.log('⏳ Ejecutando script init.sql en la base de datos...');
        await pool.query(sqlContent);
        
        console.log('✅ Base de datos inicializada exitosamente con tablas y datos semilla.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
        if (error.sql) {
            console.error('Fragmento SQL problemático:', error.sql.substring(0, 150));
        }
        process.exit(1);
    }
}

initializeDatabase();
