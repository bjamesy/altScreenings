const { Pool } = require('pg');
// original heroku app string
// const connectionString = 'postgres://fsoehenxfuofyg:0838ffd43dcceb07a8f4fb524c3f685c7bb812e4b691861a24ef909f09be4c23@ec2-52-71-85-210.compute-1.amazonaws.com:5432/d1sjibbrj48n8f';
// second app string
const connectionString = 'postgres://urivdkayxfwgjh:9a243376f1a725f56a86fe02c0e1f9e12e4c2c952a03cb1ba2ae71df02802291@ec2-54-163-254-204.compute-1.amazonaws.com:5432/dfm4j978g4veks';
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