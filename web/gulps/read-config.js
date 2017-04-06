/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

let fs = require('fs');

function readConfig(configFile) {
    let config = fs.readFileSync(configFile).toString();
    return JSON.parse(config);
}

module.exports = readConfig;