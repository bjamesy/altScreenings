const db       = require('./index');
const { Pool } = require('pg');
const connectionString = 'postgres://fsoehenxfuofyg:0838ffd43dcceb07a8f4fb524c3f685c7bb812e4b691861a24ef909f09be4c23@ec2-52-71-85-210.compute-1.amazonaws.com:5432/d1sjibbrj48n8f';
const pool     = new Pool({ 
    connectionString: connectionString 
});

module.exports =  {
    async seedScreening(screenings, theatre, url) {
        // postgres "transaction" 
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            let theatreSql = 'INSERT INTO theatre (name, url) VALUES ($1, $2) returning *';
            let params1 = [theatre, url]; 

            const result = await db.query(theatreSql, params1);
            console.log('THEATRE RESULT: ', result.rows[0]);
            
            for(const screening of screenings) {    
                let sql = 'INSERT INTO screening (title, link, showtime, theatre_id) VALUES ($1, $2, $3, $4) returning *';
                let params = [
                    screening.title,
                    screening.link,
                    screening.showtime,
                    result.rows[0].id
                ];
    
                const { rows } = await db.query(sql, params);
                console.log('screening RESULT: ', rows[0]);

                await client.query('COMMIT');
            }    
        } catch(err) {
            console.log('seedScreening ERROR: ', err)
            await client.query('ROLLBACK');
        } finally {
            await client.release();
        }
    },
    async deleteSeeds() {
        try { 
            let sql = 'DELETE FROM screening;';
            let theatreSQL = 'DELETE FROM theatre;';
            const { rowCount } = await db.query(sql);
            const result = await db.query(theatreSQL);
            
            console.log('REMOVED theatre SEEDS: ', result.rowCount);
            console.log('REMOVED SEEDS: ', rowCount);    
        } catch(err) {
            console.log('deleteSeed ERROR: ', err);
        }
    },
    async seedTheatre(theatre, url) {
        try {
            let sql = "INSERT INTO theatre (name, url, no_screenings) VALUES ($1, $2, $3) returning *";
            let params = [
                theatre, 
                url,
                true
            ];
    
            const { rows } = await db.query(sql, params);
            console.log('THEATRE without screenings: ', rows);    
            return rows;
        } catch(err) {
            console.log('seedTheatre ERROR: ', err);
            return err;
        }
    }
}