const { Pool } = require('pg');
const connectionString = 'postgres://fsoehenxfuofyg:0838ffd43dcceb07a8f4fb524c3f685c7bb812e4b691861a24ef909f09be4c23@ec2-52-71-85-210.compute-1.amazonaws.com:5432/d1sjibbrj48n8f';

const pool = new Pool({
    connectionString: connectionString
});

module.exports = {
    query(sql, params) {
        return new Promise((resolve, reject) => {
            pool.query(sql, params)
                .then(result => {
                    console.log('QUERY ! ')
                    resolve(result);
                })
                .catch(err => {
                    reject(err);
                })
        })
    }
}