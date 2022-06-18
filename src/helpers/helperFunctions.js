export default class Helpers {

    /**
     * return true in case of entered text is a link
     */
    static linkValidator(url) {
        return /^(http|https):\/\/[^ "]+$/.test(url);
    }
}