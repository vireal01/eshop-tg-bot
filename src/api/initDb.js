import Api from "../services/eshopApiRequests.js"
import DataBaseApi from "./db.js"


async function initDb() {
    await DataBaseApi.createGameTableIfNotCreated()
    await DataBaseApi.createFavGamesTableIfNotCreated()
    await DataBaseApi.createFavGamesPricesTableIfNotCreated()
    await Api.getGamesOfEuropeRegion()
}

initDb()