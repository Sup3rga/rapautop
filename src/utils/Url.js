
export default class Url{
    static get(){
        return window.location.pathname;
    }

    static getHash(){
        return window.location.hash;
    }
}