import Api from "../services/eshopApiRequests.js"
import DataBaseApi from "./db.js"


async function initDb() {
    await DataBaseApi.createGameTableIfNotCreated()
    await DataBaseApi.createGameTableIfNotCreated(true)
    await DataBaseApi.createGamesPricesTableIfNotCreated()
    await Api.getGamesOfEuropeRegion()
}

initDb()