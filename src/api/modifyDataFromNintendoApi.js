import Helpers from '../helpers/helperFunctions.js'

export default class ModifyData {
    static modifyData(data) {
        try {
            const modifyedData = {}
            modifyedData.fs_id = JSON.stringify(data.fs_id).replaceAll('"', '\'')
            modifyedData.url = JSON.stringify(data.url).replaceAll('"', '\'')
            modifyedData.image_url = JSON.stringify(data.image_url).replaceAll('"', '\'')
            modifyedData.nsuid = Number.parseInt(data.nsuid_txt[0])
            modifyedData.title = JSON.stringify((data.title).replaceAll('"', '').replaceAll('\'', '')).replaceAll('"', '\'')
            modifyedData.normalizedTitle = JSON.stringify(Helpers.normalizeTitle(data.title)).replaceAll('"', '\'')
            modifyedData.price_has_discount = data.price_discount_percentage_f !== 0
            modifyedData.age_rating_value = Number.parseInt(data.age_rating_value) ? Number.parseInt(data.age_rating_value) : 0
            return modifyedData
        } catch (error) {
        }
    }

    static modifyStoredGameData(data) {
        try {
            const modifyedData = {}
            modifyedData.fs_id = data.fs_id
            modifyedData.url = JSON.stringify(data.url).replaceAll('"', '\'')
            modifyedData.image_url = JSON.stringify(data.image_url).replaceAll('"', '\'')
            modifyedData.nsuid = Number.parseInt(data.nsuid)
            modifyedData.title = JSON.stringify((data.title).replaceAll('"', '').replaceAll('\'', '')).replaceAll('"', '\'')
            modifyedData.normalizedTitle = JSON.stringify(data.normalized_title).replaceAll('"', '\'')
            modifyedData.age_rating_value = JSON.stringify(data.age_rating_value)
            modifyedData.price_has_discount = data.price_has_discount
            return modifyedData
        } catch (error) {
        }
    }

    static modifyPriceData(data) {
        try {
            const modifyedData = {}
            modifyedData.priceInUsd = data.priceInUsd
            modifyedData.isDiscount = data.isDiscount
            modifyedData.countyEmoji = JSON.stringify(data.countyEmoji)
            modifyedData.regularPrice = JSON.stringify(data.regularPrice).replaceAll('"', '\'')
            modifyedData.localCurency = JSON.stringify(data.localCurency).replaceAll('"', '\'')
            modifyedData.discountPrice = JSON.stringify(data.discountPrice).replaceAll('"', '\'')
            modifyedData.discountEndDate = JSON.stringify(data.discountEndDate).replaceAll('"', '\'')
            modifyedData.discountEndTimestamp = JSON.stringify(data.discountEndTimestamp).replaceAll('"', '\'')
            modifyedData.salePercent = JSON.stringify(data.salePercent).replaceAll('"', '\'')
            modifyedData.id = data.id
            modifyedData.countyEmoji = JSON.stringify(data.countyEmoji).replaceAll('"', '\'')
            modifyedData.idAndRegion = JSON.stringify(data.idAndRegion).replaceAll('"', '\'')
            modifyedData.region = JSON.stringify(data.region).replaceAll('"', '\'')
            return modifyedData
        } catch (error) {
        }
    }
}