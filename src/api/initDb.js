import Api from "../services/eshopApiRequests.js"
import DataBaseApi from "./db.js"


async function initDb() {
    await DataBaseApi.createGameTableIfNotCreated()
    await Api.getGamesOfEuropeRegion()
}

initDb()