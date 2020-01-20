const { Pool } = require('pg');

const pool = new Pool();

module.exports = {
    query(sql, params) {
        return new Promise((resolve, reject) => {
            pool.query(sql, params)
                .then(result => {
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
}