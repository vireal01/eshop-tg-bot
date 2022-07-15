import pg from 'pg';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

export default class DataBaseApi {
    static gameTableName = 'Games'

    static poolArgs = {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
        password: process.env.PGPASSWORD
    }

    static initDatabase() {
        this.reateGameTableIfNotCreated()
    }

    static async createGameTableIfNotCreated() {
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `CREATE TABLE IF NOT EXISTS ${this.gameTableName} (
            nsuid BIGINT PRIMARY KEY,
            url TEXT,
            image_url TEXT,
            title TEXT,
            normalized_title TEXT,
            fs_id TEXT
        );`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static async updateGamesTable(modifiedData) {
        if (!modifiedData) {
            return null
        }
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `INSERT INTO games(nsuid, url, image_url, title, normalized_title, fs_id)
            VALUES(${modifiedData.nsuid}, ${modifiedData.url}, ${modifiedData.image_url}, ${modifiedData.title}, ${modifiedData.normalizedTitle}, ${modifiedData.fs_id})
            ON CONFLICT(nsuid)
	        DO 
	        UPDATE 
	        SET url = ${modifiedData.url},
            image_url = ${modifiedData.image_url},
            title = ${modifiedData.title},
            normalized_title = ${modifiedData.normalizedTitle},
            fs_id = ${modifiedData.fs_id};`,
            (err) => {
                if (err !== undefined) {
                    console.log(modifiedData)
                    console.log(err)
                }
            })
        await pool.end()
    }

    static async getGameDataFromBdByColumn({ table, column, value }) {
        const pool = new pg.Pool(this.poolArgs)
        let response;
        pool.query(
            `SELECT * FROM ${table} WHERE ${column} = ${value};`,
            (err, res) => {
                if (err !== undefined) {
                    console.log(err)
                    response = 'Game can\'t be found'
                }
                if (!res["rows"].length) {
                    response = "Game can\'t be found"
                } else {
                    response = JSON.parse(JSON.stringify(res["rows"][0]))
                }
            })
        await pool.end()
        return response;
    }

    static client = new pg.Client(this.poolArgs)
}