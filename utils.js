
class Utils {
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

let utils = new Utils();
export default utils;