const pool = require('../config/database');

const findAll = async () => {
    const [rows] = await pool.query('SELECT id, name, description, module FROM permissions ORDER BY module, name');
    return rows;
};

const findByIds = async (ids) => {
    if (!ids || ids.length === 0) return [];
    const [rows] = await pool.query('SELECT id, name, description, module FROM permissions WHERE id IN (?)', [ids]);
    return rows;
};

module.exports = {
    findAll,
    findByIds
};
