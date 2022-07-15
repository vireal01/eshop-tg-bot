import pg from 'pg';
import RDS from 'aws-sdk';

export default class DataBaseApi {
    static gameTableName = 'Games'

    static pool = new pg.Pool({
        user: 'v.koshmyakov',
        host: 'localhost',
        database: 'tg_bot',
        // password: 'secretpassword',
        port: 5432,
    })

    static createGameTableIfNotCreated() {
        this.pool.query(
            `CREATE TABLE IF NOT EXISTS ${this.gameTableName} (
            nsuid BIGINT PRIMARY KEY,
            url TEXT,
            image_url TEXT,
            title TEXT,
            fs_id TEXT
        );`, (err, res) => {
            console.log(err, res)
            this.pool.end()
        })
    }

    static updateGamesTable(modifiedData) {
        console.log(`${modifiedData.nsuid}, ${modifiedData.url}, ${modifiedData.image_url}, ${modifiedData.title}, ${modifiedData.fs_id}`)
        this.pool.query(
            `INSERT INTO games(nsuid, url, image_url, title, fs_id)
            VALUES(${modifiedData.nsuid}, ${modifiedData.url}, ${modifiedData.image_url}, ${modifiedData.title}, ${modifiedData.fs_id})
            ON CONFLICT(nsuid)
	        DO 
	        UPDATE 
	        SET url = ${modifiedData.url},
            image_url = ${modifiedData.image_url},
            title = ${modifiedData.title},
            fs_id = ${modifiedData.fs_id};`,
            (err, res) => {
                console.log(err, res)
                this.pool.end()
            })
    }

    static client = new pg.Client({
        user: 'v.koshmyakov',
        host: 'localhost',
        database: 'tg_bot',
        // password: 'secretpassword',
        port: 5432,
    })
}

DataBaseApi.createGameTableIfNotCreated()