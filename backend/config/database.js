const mysql = require('mysql2/promise');

const poolConfig = process.env.DATABASE_URL || process.env.MYSQL_URL
    ? {
        uri: process.env.DATABASE_URL || process.env.MYSQL_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true
    }
    : {
        host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
        user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
        password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
        database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'taller_motos',
        port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        multipleStatements: true
    };

const pool = mysql.createPool(poolConfig);

module.exports = pool;