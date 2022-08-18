const packageJson = require('../package.json');
const apiPrefix = packageJson.apiPrefix;
const apiURL = packageJson.server.protocol + '://' + packageJson.server.host + ':' + packageJson.server.port + apiPrefix;


class Clients {
    constructor(apiURL) {
        this.apiURL = apiURL;
    }
    async create({...body}) {
        const response = await fetch(apiURL + 'clients', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return (await response.json()).data;
    }
    async search({...body}) {
        const response = await fetch(apiURL + 'clients/search', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return (await response.json()).data;
    }
    async read() {
        const response = await fetch(apiURL + 'clients', {method: 'GET'});
        return (await response.json()).data;
    }
    async update({id, ...body}) {
        const response = await fetch(apiURL + 'clients/' + id, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        return (await response.json()).data;
    }
    async delete(id) {
        const response = await fetch(apiURL + 'clients/' + id, {method: 'DELETE'});
        return (await response.json()).data;
    }
}


class Pets {
    constructor(apiURL) {
        this.apiURL = apiURL;
    }
    async create({...body}) {
        const response = await fetch(apiURL + 'pets', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return (await response.json()).data;
    }
    async search({...body}) {
        const response = await fetch(apiURL + 'pets/search', {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return (await response.json()).data;
    }
    async read() {
        const response = await fetch(apiURL + 'pets', {method: 'GET'});
        return (await response.json()).data;
    }
    async update({id, ...body}) {
        const response = await fetch(apiURL + 'pets/' + id, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
        return (await response.json()).data;
    }
    async delete(id) {
        const response = await fetch(apiURL + 'pets/' + id, {method: 'DELETE'});
        return (await response.json()).data;
    }
}

class Api {
  constructor() {
    this.apiURL = apiURL;
    this.clients = new Clients(apiURL);
    this.pets = new Pets(apiURL);
  }
}

module.exports = Api;

