/**
 * @author Felix Huang <yelfivehuang@gmail.com>
 */

/**
 * arrayBuffer()
 * blob()
 * json()
 * text()
 * formData()
 * Usage:
 * fetch(url, options).then
 *
 *  Request({
 *      url:
 *      data:
 *      success
 *  }).then()
 *  .then()
 *   method: 'GET',
 headers: myHeaders,
 mode: 'cors',
 cache: 'default' };

 request('hello/world', {method: '', headers: '', mode: '', cache: ''})
 */

/**
 *
 * @param callback
 * @returns {Promise}
 */
Promise.prototype.done = function (callback) {
    return this.then(callback).catch(callback).catch(function (error) {
        console.error(error)
    });
};

/**
 *
 * @param {string} url
 * @param {Object} opts
 * @returns {Promise}
 */

function request(url, opts) {
    return new Promise(function (resolve, reject) {
        let f = fetch(url, opts);
        /**
         * Response methods:
         * arrayBuffer()
         * blob()
         * json()
         * text()
         * formData()
         */
        let dataType = Response.prototype[opts.dataType] instanceof Function ? opts.dataType : 'text';
        f = f.then(function (response) {
            return response[dataType]();
        });
        if (dataType === 'json') {
            f = f.then(function (data) {
                if (data.code < 400) {
                    resolve(data);
                } else {
                    reject(data);
                }
            });
        }
        f.catch(function (response) {
            reject(response);
        });
    });
}

export default request;