export default class Helpers {
    /**
     * return true in case of entered text is a link
     */
    static linkValidator(url) {
        return /^(http|https):\/\/[^ "]+$/.test(url);
    }

    static normalizeTitle(titleString) {
        return titleString.normalize("NFD")
            .replace(/\p{Diacritic}/gu, '')
            .replaceAll(/[^ a-zA-Z0-9_.,]+/g, ' ')
            .replaceAll(/([ ]{2,})/gu, ' ')
            .replaceAll(',', '.')
            .toLowerCase().trim()
    }
}