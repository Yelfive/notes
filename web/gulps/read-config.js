/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

let fs = require('fs');

function readConfig(configFile) {
    let config = fs.readFileSync(configFile).toString();
    try {
        return JSON.parse(config);
    } catch (e) {
        return {};
    }
}

module.exports = readConfig;