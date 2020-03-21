import crypto from 'crypto';

class Utils {
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Build an MD5 hash from an array
     * 
     * @param {array} parts Array of components to build the hash
     */
    md5FromArray(parts) {
        let text = parts.join("/");
        console.log(text);

        return crypto.createHash('md5').update(text).digest("hex");
    }
}

let utils = new Utils();
export default utils;