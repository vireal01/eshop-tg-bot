import pg from 'pg';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

export default class DataBaseApi {
    static gameTableName = 'Games'
    static favGamesTableName = 'Favorites'
    static favGamesPricesTableName = 'FavPrices'

    static poolArgs = {
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
        password: process.env.PGPASSWORD
    }

    static async createGameTableIfNotCreated(isFavTable = false) {
        const tableName = isFavTable ? this.favGamesTableName : this.gameTableName
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `CREATE TABLE IF NOT EXISTS ${tableName} (
            nsuid BIGINT PRIMARY KEY,
            url TEXT,
            image_url TEXT,
            title TEXT,
            normalized_title TEXT,
            fs_id TEXT,
            age_rating_value SMALLINT
        );`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static async createFavGamesTableIfNotCreated() {
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `CREATE TABLE IF NOT EXISTS ${this.favGamesTableName} (
            nsuid BIGINT PRIMARY KEY,
            url TEXT,
            image_url TEXT,
            title TEXT,
            normalized_title TEXT,
            fs_id TEXT,
            age_rating_value SMALLINT
        );`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static async createFavGamesPricesTableIfNotCreated() {
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `CREATE TABLE IF NOT EXISTS ${this.favGamesPricesTableName} (
            id BIGINT PRIMARY KEY,
            priceInUsd TEXT,
            isDiscount BOOLEAN,
            countyEmoji TEXT,
            regularPrice TEXT,
            localCurency TEXT,
            salePercent TEXT,
            discountEndDate TEXT
        );`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static async updateGamesTable(modifiedData, isFavTable = false) {
        const tableName = isFavTable ? this.favGamesTableName : this.gameTableName
        if (!modifiedData) {
            return null
        }
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `INSERT INTO ${tableName}(nsuid, url, image_url, title, normalized_title, fs_id, age_rating_value)
            VALUES(${modifiedData.nsuid}, 
                ${modifiedData.url}, 
                ${modifiedData.image_url}, 
                ${modifiedData.title}, 
                ${modifiedData.normalizedTitle}, 
                ${modifiedData.fs_id}, 
                ${modifiedData.age_rating_value})
            ON CONFLICT(nsuid)
	        DO 
	        UPDATE 
	        SET url = ${modifiedData.url},
            image_url = ${modifiedData.image_url},
            title = ${modifiedData.title},
            normalized_title = ${modifiedData.normalizedTitle},
            fs_id = ${modifiedData.fs_id},
            age_rating_value = ${modifiedData.age_rating_value};`,
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
                } else if (!res["rows"].length) {
                    // response = undefined (by default)
                } else {
                    response = JSON.parse(JSON.stringify(res["rows"][0]))
                }
            })
        await pool.end()
        return response;
    }

    static client = new pg.Client(this.poolArgs)
}