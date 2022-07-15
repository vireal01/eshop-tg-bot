import dataSample from '../models/gameDataSample.js'
import DataBaseApi from './backend.js'

class PrepareData {

    static modifyData(data) {
        const modifyedData = {}
        modifyedData.fs_id = JSON.stringify(data.fs_id).replaceAll('"', '\'')
        modifyedData.url = JSON.stringify(data.url).replaceAll('"', '\'')
        modifyedData.image_url = JSON.stringify(data.image_url).replaceAll('"', '\'')
        modifyedData.nsuid = Number.parseInt(data.nsuid_txt[0])
        modifyedData.title = JSON.stringify((data.title).replaceAll('"', '')).replaceAll('"', '\'')
        return modifyedData
    }

    static dataSample = {
        fs_id: '2041935',
        url: '/Games/Nintendo-Switch-download-software/-METAL-SLUG-1st-2nd-MISSION-Double-Pack-2041935.html',
        image_url: 'https://fs-prod-cdn.nintendo-europe.com/media/images/11_square_images/games_18/nintendo_switch_download_software/SQ_NSwitchDS_MetalSlug1stAnd2ndMissionDoublePack_image500w.jpg',
        nsuid_txt: ['70010000034009'],
        price_has_discount_b: false,
        price_discount_percentage_f: 0,
        title: '"METAL SLUG 1st & 2nd MISSION" Double Pack',
        price_regular_f: 13.49,
        price_sorting_f: 13.49,
        price_lowest_f: 13.49,
    }
}

const data = PrepareData.modifyData(dataSample.euData)
DataBaseApi.updateGamesTable(data)