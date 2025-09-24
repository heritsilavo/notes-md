import { CRYPTO_JS_KEY } from "@env";

const CryptoJS = require("crypto-js");

export function encrypt(text: string): string {
    console.log("TEXT: ", text);
    console.log("KEY: ", CRYPTO_JS_KEY);
    
    return CryptoJS.AES.encrypt(text, CRYPTO_JS_KEY).toString();
}

export function decrypt(encryptedText: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedText, CRYPTO_JS_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}