import Api from "./eshopApiRequests.js";
import { countryCodeEmoji, emojiCountryCode } from "country-code-emoji";
import CC from 'currency-converter-lt';
import DataBaseApi from "../api/db.js";
import ModifyData from "../api/modifyDataFromNintendoApi.js";

export default class GameInfo {
    /**
     * Country code: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2
     */
    static availableRegionsList = ['PL', 'ZA', 'FR', 'GB', 'SE', 'NO']
    static regionList = ['PL', 'ZA']

    static updateRegionList(countryCode) {
        this.regionList.push(countryCode)
        this.regionList = [...new Set(this.regionList)]
    }

    static async formatGamePriceArrayToCustomFields(priceData) {
        const parsedElement = JSON.parse(JSON.stringify(priceData))
        const countyEmoji = countryCodeEmoji(parsedElement.region)
        const regularPrice = parsedElement.regular_price
        const discountPrice = parsedElement.discount_price
        const isDiscount = discountPrice ? true : false
        const priceToCalculate = discountPrice ? discountPrice?.amount : regularPrice.amount
        const priceInUsd = await this.calculatePriceInUSD(priceToCalculate, regularPrice.currency)
        const id = parsedElement.title_id
        const region = parsedElement.region
        let salePercent = null;
        if (isDiscount) {
            salePercent = this.calculateSalePercent(regularPrice.amount, discountPrice.amount)
        }
        const formatedData = {
            priceInUsd: priceInUsd,
            isDiscount,
            countyEmoji,
            regularPrice: regularPrice.amount,
            localCurency: regularPrice.currency,
            discountPrice: isDiscount ? discountPrice.amount : null,
            discountEndTimestamp: isDiscount ? (new Date(discountPrice.end_datetime).getTime()) : null,
            discountEndDate: isDiscount ? discountPrice.end_datetime : null,
            salePercent,
            id,
            region,
            idAndRegion: id + region
        }
        console.log(formatedData)
        await DataBaseApi.updateGamePriceTable(ModifyData.modifyPriceData(formatedData))
        return JSON.parse(JSON.stringify(formatedData))
    }

    static async stringifyPriceData(pricesData) {
        //{"title_id":70010000011030,"sales_status":"onsale","regular_price":{"amount":"R328.00","currency":"ZAR","raw_value":"328"},"discount_price":{"amount":"R65.60","currency":"ZAR","raw_value":"65.60","start_datetime":"2022-05-24T13:00:00Z","end_datetime":"2022-06-23T21:59:59Z"},"gold_point":{"basic_gift_gp":"33","basic_gift_rate":"0.05","consume_gp":"0","extra_gold_points":[],"gift_gp":"33","gift_rate":"0.05"}}
        const formatedPrices = []
        // const arrOfPrices = await this.formatGamePriceArrayToCustomFields(pricesData)
        const sortedArray = pricesData.sort((a, b) => a.priceinusd - b.priceinusd)
        for (const elementData of sortedArray) {
            const saleAmount = elementData.isdiscount ?
                `Sale: ${elementData.salepercent} % \n` : ''
            const saleString = elementData.isdiscount ? `\nOn sale price: ${elementData.discountprice} \nOffer ends: ${this.formateDate(elementData.discountenddate)}` : ''
            formatedPrices.push(`<a>${elementData.countyemoji} ${saleAmount}Currency: ${elementData.localcurency}. \nFull-price ${elementData.regularprice} ${saleString} \nUSD: ${elementData.priceinusd}$</a>`)
        }
        return formatedPrices
    }

    static getCountyFlagByCode(countryCode) {
        return countryCodeEmoji(countryCode)
    }

    static getCountyCodeByFlag(countryFlag) {
        return emojiCountryCode(countryFlag)
    }

    static calculateSalePercent(fullPrice, discountPrice) {
        return ((1 - this.formatPrice(discountPrice) / this.formatPrice(fullPrice)) * 100).toFixed(0)
    }

    static formatPrice(price) {
        const priceArr = price.match(/\d[,.]*/g).join('').replace(',', '.').split('.')
        return Number.parseFloat(`${priceArr.slice(0, -1).join('')}.${priceArr.slice(-1)[0]}`)
    }

    static formateDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC', hour: '2-digit', minute: '2-digit'
        };
        return date.toLocaleString('en-US', options)
    }

    static async calculatePriceInUSD(itemPrice, currency) {
        const price = this.formatPrice(itemPrice);
        let currencyConverter = new CC({ from: currency, to: "USD", amount: price, isDecimalComma: true })
        let priceInUsd
        await currencyConverter.convert().then((response) => {
            priceInUsd = response.toFixed(1)
        })
        return priceInUsd
    }

    static async getPrices(gameData) {
        const prices = []
        for await (const region of this.regionList) {
            let priceData = await this.findPriceInDbPricesTable(gameData.nsuid, region)
            if (!priceData) {
                const rawPriceData = await Api.getGamePrice({ country: region, gameId: gameData.nsuid })
                rawPriceData.region = region
                priceData = await this.formatGamePriceArrayToCustomFields(rawPriceData)
            }
            prices.push(priceData)
        }
        return prices
    }

    static async findPriceInDbPricesTable(id, region) {
        const idAndRegion = id + region
        const data = await DataBaseApi.getGameDataFromBdByColumn({
            table: DataBaseApi.favGamesPricesTableName,
            column: 'idandregion',
            value: JSON.stringify(idAndRegion).replaceAll('"', "'")
        })
        return data
    }

    static getGamePurchaseLink(gameData) {
        const changeRegionLink = '<a>🔄 Change region: \nhttps://accounts.nintendo.com/profile/edit</a>'
        const gamePurchaseLink = `<a>💵 Buy game: \nhttps://ec.nintendo.com/title_purchase_confirm?title=${gameData.nsuid}</a>`
        return changeRegionLink + '\n' + gamePurchaseLink
    }

    static getGameTitle(gameData) {
        return `<a href="https://www.nintendo.co.uk${gameData.url}">${gameData.title}</a>`
    }

    static async compileInfoMessage(gameData) {
        if (!gameData) {
            return 'The game can\'t be found'
        }
        const prices = await GameInfo.getPrices(gameData)
        const stringifiedData = await GameInfo.stringifyPriceData(prices)
        const priceText = stringifiedData.join('\n\n')
        return this.getGameTitle(gameData) + '\n\n' + priceText + '\n\n' + this.getGamePurchaseLink(gameData)
    }

    static async getGameInfoMessage(url) {
        const gameData = await Api.getGameObjByUrl(url)
        const ans = await this.compileInfoMessage(gameData)
        return ans
    }

    static async getGameInfoMessageByTitle(title) {
        const gameData = await Api.getGameObjByTitle(title)
        if (typeof gameData === "string") {
            return gameData
        }
        return this.compileInfoMessage(gameData)
    }

    static async addGameToFav(title) {
        const gameData = await Api.getGameObjByTitle(title)
        if (typeof gameData === "string") {
            return gameData
        }
        if (!gameData) {
            return 'Game can\'t be found'
        }
        const modifiedGameItem = ModifyData.modifyStoredGameData(gameData)
        try {
            await DataBaseApi.updateGamesTable(modifiedGameItem, true)
        } catch (error) {
            return 'Error during the adding to favorites'
        }
        return `${modifiedGameItem.title} successfully added to favorites`
    }
}
