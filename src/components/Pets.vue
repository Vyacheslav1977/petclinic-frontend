<template>
  <div class="pets">
    <div class="container-fluid">
      <div class="row">
        <div class="btn-add-new p-2 col-8"><b-button v-b-modal.modal-pet-edit>Добавить нового питомца</b-button></div>
        <div class="p-2 col-4 search-area">
          <input class="form-control" type="search" placeholder="Начните вводить текст для поиска..." aria-label="Search" v-model="searchValue" @input="quickSearch">
        </div>
      </div>
    </div>
    <b-table bordered striped hover :items="pets" :fields="fields" @row-clicked="rowClicked"></b-table>

    <b-modal
      id="modal-pet-edit"
      ref="modal"
      title="Питомец"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
      <div v-if="id" class="mb-3">ID: <strong>{{ id }}</strong></div>
          <b-form-input
            id="id-input"
            v-model="id"
            hidden
          ></b-form-input>
        <b-form-group
          label="Имя питомца:"
          label-for="name-input"
          invalid-feedback="Имя питомца обязательно для заполнения"
          :state="nameState"
        >
          <b-form-input
            id="name-input"
            v-model="name"
            :state="nameState"
            required
          ></b-form-input>
        </b-form-group>
        <div class="mt-3">Владелец: {{ client ? client.name : 'не выбран' }}</div>
        <b-button v-if="id" v-b-modal.modal-client-prevent-closing>{{ client ? 'Сменить' : 'Выбрать' }}</b-button>

        <div class="mt-2 btn-delete"><b-button v-if="id" class="btn btn-danger" @click="deletePet">Удалить питомца</b-button></div>
      </form>
    </b-modal>

  <b-modal id="modal-client-prevent-closing" scrollable title="Клиенты"
      @show="resetClientModal"
      @hidden="resetClientModal"
      @ok="handleClientOk"
      @shown="loadClients"
  >
    <div class="d-block">
      <p class="entity" v-for="client in clients" :key="client.id" @click="setClient(client)">{{ client.name + ' (id: ' + client.id + ')' }}</p>
    </div>
    <template #modal-footer>
      <b-button class="mt-3" block @click="closeClientsWindow">Отмена</b-button>
    </template>
  </b-modal>

  </div>
</template>

<script>
const Api = require('@/api');
const debounce = require('lodash.debounce');

const debounceDelayMs = 1000; // поиск на сервере начнётся только, спустя эту задержку в мс

export default {
  name: 'Pets',
  data() {
      window.pets = this;
      return {
        api: null,
        id: null,
        name: '',
        nameState: null,
        client: null,
        fields: ['id', {key: 'name', label: 'Питомец'}, {key: 'client.name', label: 'Владелец'}],
        pets: [],
        clients: [],
        searchValue: '',
      }
  },
    created() {
      this.api = new Api();
    },
    async mounted() {
      await this.loadPets();
    },
    methods: {
      setClient(client) {
        this.client = client;
        this.closeClientsWindow();
      },
      closeClientsWindow() {
        this.$bvModal.hide('modal-client-prevent-closing');
      },
      quickSearch: debounce(async function() {
        this.$parent.showSpinner();
        this.pets = await this.api.pets.search({name: this.searchValue});
        this.$parent.hideSpinner();
      }, debounceDelayMs),
      async loadPets() {
        this.$parent.showSpinner();
        this.pets = await this.api.pets.read();
        this.$parent.hideSpinner();
      },
      hidePetsWindow() {
        this.$nextTick(() => {
          this.$bvModal.hide('modal-pet-edit');
          this.resetModal();
        });
      },
      rowClicked(row) {
        this.$nextTick(() => {
          this.$bvModal.show('modal-pet-edit');
          this.id = row.id;
          this.name = row.name;
          this.client = row.client;
        })
      },
      checkFormValidity() {
        const valid = this.$refs.form.checkValidity()
        this.nameState = valid
        return valid
      },
      resetModal() {
        this.nameState = null
        this.id = null;
        this.name = '';
        this.client = null;
      },
      handleOk(bvModalEvent) {
        bvModalEvent.preventDefault()
        this.handleSubmit()
      },
      async handleSubmit() {
        if (!this.checkFormValidity()) {
          return
        }

        this.$parent.showSpinner();
        if (this.id === null)
          await this.api.pets.create({name: this.name});
        else
          await this.api.pets.update({id: this.id, name: this.name, client: this.client === null ? null : this.client.id});
        this.$parent.hideSpinner();
        this.hidePetsWindow();
        await this.loadPets();
      },
      async deletePet() {
        this.$parent.showSpinner();
        await this.api.pets.delete(this.id);
        this.$parent.hideSpinner();
        this.hidePetsWindow();
        await this.loadPets();
      },
      resetClientModal() {},
      handleClientOk(bvModalEvent) {
        bvModalEvent.preventDefault();
        this.handleSubmit();
      },
      async loadClients() {
        this.$parent.showSpinner();
        this.clients = await this.api.clients.read();
        this.$parent.hideSpinner();
      },
    },
}
</script>


<style scoped>
.btn-add-new {

}
.search-area {
  text-align: right;
}
.btn-delete {
  text-align: right;
}
.entity {
  cursor: pointer;
  background-color: transparent;
  padding: 0 5px;
}
.entity:hover {
  background-color: #b8d9ec;
}
</style>
