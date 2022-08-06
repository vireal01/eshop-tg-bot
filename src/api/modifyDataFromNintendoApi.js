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
            return modifyedData
        } catch (error) {
        }
    }
}