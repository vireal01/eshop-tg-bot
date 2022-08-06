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

    static async formatGamePriceArrayToCustomFields(pricesData) {
        const formatedPrices = [];
        for await (const priceElementData of pricesData) {
            const pasrsedElement = JSON.parse(JSON.stringify(priceElementData))
            const countyEmoji = countryCodeEmoji(pasrsedElement.region)
            const regularPrice = pasrsedElement.regular_price
            const discountPrice = pasrsedElement.discount_price
            const isDiscount = discountPrice ? true : false
            const priceToCalculate = discountPrice ? discountPrice?.amount : regularPrice.amount
            const priceInUsd = await this.calculatePriceInUSD(priceToCalculate, regularPrice.currency)
            const id = pasrsedElement.title_id
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
                discountEndDate: isDiscount ? discountPrice.end_datetime : null,
                salePercent,
                id
            }
            formatedPrices.push(JSON.parse(JSON.stringify(formatedData)))
        }
        return formatedPrices
    }

    static async stringifyPriceData(pricesData) {
        //{"title_id":70010000011030,"sales_status":"onsale","regular_price":{"amount":"R328.00","currency":"ZAR","raw_value":"328"},"discount_price":{"amount":"R65.60","currency":"ZAR","raw_value":"65.60","start_datetime":"2022-05-24T13:00:00Z","end_datetime":"2022-06-23T21:59:59Z"},"gold_point":{"basic_gift_gp":"33","basic_gift_rate":"0.05","consume_gp":"0","extra_gold_points":[],"gift_gp":"33","gift_rate":"0.05"}}
        const formatedPrices = []
        const arrOfPrices = await this.formatGamePriceArrayToCustomFields(pricesData)
        const sortedArray = arrOfPrices.sort((a, b) => a.priceInUsd - b.priceInUsd)
        for (const elementData of sortedArray) {
            const saleAmount = elementData.isDiscount ?
                `Sale: ${elementData.salePercent} % \n` : ''
            const saleString = elementData.isDiscount ? `\nOn sale price: ${elementData.discountPrice} \nOffer ends: ${this.formateDate(elementData.discountEndDate)}` : ''
            formatedPrices.push(`<a>${elementData.countyEmoji} ${saleAmount}Currency: ${elementData.localCurency}. \nFull-price ${elementData.regularPrice} ${saleString} \nUSD: ${elementData.priceInUsd}$</a>`)
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
            const priceData = await Api.getGamePrice({ country: region, gameId: gameData.nsuid })
            priceData.region = region
            prices.push(priceData)
        }
        return prices
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
