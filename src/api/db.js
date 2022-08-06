import pg from 'pg';
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

export default class DataBaseApi {
    static gameTableName = 'Games'
    static favGamesTableName = 'Favorites'
    static favGamesPricesTableName = 'Prices'

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
            price_has_discount BOOLEAN,
            age_rating_value SMALLINT
        );`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static async createGamesPricesTableIfNotCreated() {
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `CREATE TABLE IF NOT EXISTS ${this.favGamesPricesTableName} (
            idAndRegion TEXT PRIMARY KEY,
            id bigint NOT NULL,
            priceInUsd TEXT,
            discountPrice TEXT,
            isDiscount BOOLEAN,
            regularPrice TEXT,
            localCurency TEXT,
            salePercent TEXT,
            discountEndTimestamp BIGINT,
            discountEndDate Text,
            countyEmoji TEXT,
            region TEXT
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
            `INSERT INTO ${tableName}(nsuid, url, image_url, title, normalized_title, fs_id, price_has_discount, age_rating_value)
            VALUES(${modifiedData.nsuid}, 
                ${modifiedData.url}, 
                ${modifiedData.image_url}, 
                ${modifiedData.title}, 
                ${modifiedData.normalizedTitle}, 
                ${modifiedData.fs_id}, 
                ${modifiedData.price_has_discount}, 
                ${modifiedData.age_rating_value})
            ON CONFLICT(nsuid)
	        DO 
	        UPDATE 
	        SET url = ${modifiedData.url},
            image_url = ${modifiedData.image_url},
            title = ${modifiedData.title},
            normalized_title = ${modifiedData.normalizedTitle},
            fs_id = ${modifiedData.fs_id},
            price_has_discount = ${modifiedData.price_has_discount},
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

    static async updateGamePriceTable(modifiedData) {
        const tableName = this.favGamesPricesTableName
        if (!modifiedData) {
            return null
        }
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `INSERT INTO ${tableName}
                (idAndRegion,
                id,
                priceInUsd,
                discountPrice,
                isDiscount,
                regularPrice,
                localCurency,
                salePercent,
                discountEndTimestamp,
                discountEndDate,
                region,
                countyEmoji)
            VALUES(
                ${modifiedData.idAndRegion}, 
                ${modifiedData.id}, 
                ${modifiedData.priceInUsd}, 
                ${modifiedData.discountPrice}, 
                ${modifiedData.isDiscount}, 
                ${modifiedData.regularPrice}, 
                ${modifiedData.localCurency}, 
                ${modifiedData.salePercent}, 
                ${modifiedData.discountEndTimestamp},
                ${modifiedData.discountEndDate},
                ${modifiedData.region},
                ${modifiedData.countyEmoji})
            ON CONFLICT(idAndRegion)
	        DO 
	        UPDATE 
	        SET 
            idAndRegion = ${modifiedData.idAndRegion},
            id = ${modifiedData.id},
            priceInUsd = ${modifiedData.priceInUsd},
            discountPrice = ${modifiedData.discountPrice},
            isDiscount = ${modifiedData.isDiscount},
            regularPrice = ${modifiedData.regularPrice},
            localCurency = ${modifiedData.localCurency},
            salePercent = ${modifiedData.salePercent},
            discountEndTimestamp = ${modifiedData.discountEndTimestamp},
            discountEndDate = ${modifiedData.discountEndDate},
            region = ${modifiedData.region},
            countyEmoji = ${modifiedData.countyEmoji};`,
            (err) => {
                if (err !== undefined) {
                    console.log(modifiedData)
                    console.log(err)
                }
            })
        await pool.end()
    }

    static clearPricesWithEndedDeals() {
        const pool = new pg.Pool(this.poolArgs)
        pool.query(
            `DELETE FROM ${this.favGamesPricesTableName}
            WHERE discountEndTimestamp < ${new Date().getTime()};`, (err, res) => {
            console.log(err, res)
            pool.end()
        })
    }

    static client = new pg.Client(this.poolArgs)
}