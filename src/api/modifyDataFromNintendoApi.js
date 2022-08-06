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
            modifyedData.price_in_usd = data.price_in_usd
            modifyedData.is_discount = data.is_discount
            modifyedData.county_emoji = JSON.stringify(data.county_emoji)
            modifyedData.regular_price = JSON.stringify(data.regular_price).replaceAll('"', '\'')
            modifyedData.local_curency = JSON.stringify(data.local_curency).replaceAll('"', '\'')
            modifyedData.discount_price = JSON.stringify(data.discount_price).replaceAll('"', '\'')
            modifyedData.discount_end_date = JSON.stringify(data.discount_end_date).replaceAll('"', '\'')
            modifyedData.discount_end_timestamp = JSON.stringify(data.discount_end_timestamp).replaceAll('"', '\'')
            modifyedData.sale_percent = JSON.stringify(data.sale_percent).replaceAll('"', '\'')
            modifyedData.id = data.id
            modifyedData.county_emoji = JSON.stringify(data.county_emoji).replaceAll('"', '\'')
            modifyedData.id_and_region = JSON.stringify(data.id_and_region).replaceAll('"', '\'')
            modifyedData.region = JSON.stringify(data.region).replaceAll('"', '\'')
            return modifyedData
        } catch (error) {
        }
    }
}