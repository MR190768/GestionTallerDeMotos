const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Database connected successfully');
        console.log(`Server is running on http://${HOST}:${PORT}`);
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
});