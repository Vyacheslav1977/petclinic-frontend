const packageJson = require('../package.json');
const apiPrefix = packageJson.apiPrefix;
const apiURL = packageJson.server.protocol + '://' + packageJson.server.host + ':' + packageJson.server.port + apiPrefix;


async function proxyFetch(url, opts, vm) {
    const proxyAPI = (apiRes, vm) => {
        let data;
        if (apiRes.code !== 200) {
          vm.$parent.$refs.alerts.add(`<strong>${apiRes.message || 'Нераспознанная ошибка'}</strong><br>Код ошибки: ${apiRes.code}<br>Запрошенный URL: ${apiRes.url}`);
        }
        else data = apiRes.data;
        return {data, statusCode: apiRes.code};
    };
    let code, data, message;
    try {
        vm.$parent.showSpinner();
        const response = await fetch(url, opts);
        const resObj = await response.json();
        code = response.status;
        data = resObj.data;
        message = resObj.message;
    }
    catch (e) {
        code = 504;
        data = null;
        message = 'Сервер API недоступен.';
    }
    finally {
        vm.$parent.hideSpinner();
    }
    return proxyAPI({
        code,
        data,
        message,
        url
    }, vm);
}



class Clients {
    constructor(apiURL, vm) {
        this.vm = vm;
        this.apiURL = apiURL;
    }
    async testError() {
        return proxyFetch('http://bad.servername/nedostupen/', {method: 'GET'}, this.vm);
    }
    async create({...body}) {
        return proxyFetch(apiURL + 'clients', {
            method: 'POST',
            body: JSON.stringify(body)
        }, this.vm);
    }
    async search({...body}) {
        return proxyFetch(apiURL + 'clients/search', {
            method: 'POST',
            body: JSON.stringify(body)
        }, this.vm);
    }
    async read() {
        return proxyFetch(apiURL + 'clients', {method: 'GET'}, this.vm);
    }
    async update({id, ...body}) {
        return proxyFetch(apiURL + 'clients/' + id, {
            method: 'PUT',
            body: JSON.stringify(body)
        }, this.vm);
    }
    async delete(id) {
        return proxyFetch(apiURL + 'clients/' + id, {method: 'DELETE'}, this.vm);
    }
}


class Pets {
    constructor(apiURL, vm) {
        this.vm = vm;
        this.apiURL = apiURL;
    }
    async create({...body}) {
        return proxyFetch(apiURL + 'pets', {
            method: 'POST',
            body: JSON.stringify(body)
        }, this.vm);
    }
    async search({...body}) {
        return proxyFetch(apiURL + 'pets/search', {
            method: 'POST',
            body: JSON.stringify(body)
        }, this.vm);
    }
    async read() {
        return proxyFetch(apiURL + 'pets', {method: 'GET'}, this.vm);
    }
    async update({id, ...body}) {
        return proxyFetch(apiURL + 'pets/' + id, {
            method: 'PUT',
            body: JSON.stringify(body)
        }, this.vm);
    }
    async delete(id) {
        return proxyFetch(apiURL + 'pets/' + id, {method: 'DELETE'}, this.vm);
    }
}

class Api {
  constructor(vm) {
    this.apiURL = apiURL;
    this.clients = new Clients(apiURL, vm);
    this.pets = new Pets(apiURL, vm);
  }
}

module.exports = Api;

