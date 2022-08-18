<template>
  <div class="clients">
    <div class="container-fluid">
      <div class="row">
        <div class="btn-add-new p-2 col-8"><b-button v-b-modal.modal-client-edit>Добавить нового клиента</b-button></div>
        <div class="p-2 col-4 search-area">
          <input class="form-control" type="search" placeholder="Начните вводить текст для поиска..." aria-label="Search" v-model="searchValue" @input="quickSearch">
        </div>
      </div>
    </div>
    <b-table bordered striped hover :items="clients" :fields="fields" @row-clicked="rowClicked"></b-table>

    <b-modal
      id="modal-client-edit"
      ref="modal"
      title="Клиент"
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
          label="Имя клиента:"
          label-for="name-input"
          invalid-feedback="Имя клиента обязательно для заполнения"
          :state="nameState"
        >
          <b-form-input
            id="name-input"
            v-model="name"
            :state="nameState"
            required
          ></b-form-input>
        </b-form-group>
        <div class="mt-3">Питомец: {{ pet ? pet.name : 'не выбран' }}</div>
        <b-button v-if="id" v-b-modal.modal-pet-prevent-closing>{{ pet ? 'Сменить' : 'Выбрать' }}</b-button>
        
        <div class="mt-2 btn-delete"><b-button v-if="id" class="btn btn-danger" @click="deleteClient">Удалить клиента</b-button></div>
      </form>
    </b-modal>

  <b-modal id="modal-pet-prevent-closing" scrollable title="Питомцы"
      @show="resetPetModal"
      @hidden="resetPetModal"
      @ok="handlePetOk"
      @shown="loadPets"
  >
    <div class="d-block">
      <p class="entity" v-for="pet in pets" :key="pet.id" @click="setPet(pet)">{{ pet.name + ' (id: ' + pet.id + ')' }}</p>
    </div>
    <template #modal-footer>
      <b-button class="mt-3" block @click="closePetsWindow">Отмена</b-button>
    </template>
  </b-modal>

  </div>
</template>

<script>
const Api = require('@/api');
const debounce = require('lodash.debounce');

const debounceDelayMs = 1000; // поиск на сервере начнётся только, спустя эту задержку в мс

export default {
  name: 'Clients',
  data() {
      window.clients = this;
      return {
        api: null,
        id: null,
        name: '',
        nameState: null,
        pet: null,
        fields: ['id', {key: 'name', label: 'Клиент'}, {key: 'pet.name', label: 'Питомец'}],
        clients: [],
        pets: [],
        searchValue: '',
      }
    },
    created() {
      this.api = new Api();
    },
    async mounted() {
      await this.loadClients();
    },
    methods: {
      setPet(pet) {
        this.pet = pet;
        this.closePetsWindow();
      },
      closePetsWindow() {
        this.$bvModal.hide('modal-pet-prevent-closing');
      },
      quickSearch: debounce(async function() {
        this.$parent.showSpinner();
        this.clients = await this.api.clients.search({name: this.searchValue});
        this.$parent.hideSpinner();
      }, debounceDelayMs),
      async loadClients() {
        this.$parent.showSpinner();
        this.clients = await this.api.clients.read();
        this.$parent.hideSpinner();
      },
      hideClientsWindow() {
        this.$nextTick(() => {
          this.$bvModal.hide('modal-client-edit');
          this.resetModal();
        });
      },
      rowClicked(row) {
        this.$nextTick(() => {
          this.$bvModal.show('modal-client-edit');
          this.id = row.id;
          this.name = row.name;
          this.pet = row.pet;
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
        this.pet = null;
      },
      handleOk(bvModalEvent) {
        bvModalEvent.preventDefault()
        this.handleSubmit()
      },
      async handleSubmit() {
        if (!this.checkFormValidity()) {
          return;
        }

        this.$parent.showSpinner();
        if (this.id === null)
          await this.api.clients.create({name: this.name});
        else
          await this.api.clients.update({id: this.id, name: this.name, pet: this.pet === null ? null : this.pet.id});
        this.$parent.hideSpinner();
        this.hideClientsWindow();
        await this.loadClients();
      },
      async deleteClient() {
        this.$parent.showSpinner();
        await this.api.clients.delete(this.id);
        this.$parent.hideSpinner();
        this.hideClientsWindow();
        await this.loadClients();
      },
      resetPetModal() {},
      handlePetOk(bvModalEvent) {
        bvModalEvent.preventDefault();
        this.handleSubmit();
      },
      async loadPets() {
        this.$parent.showSpinner();
        this.pets = await this.api.pets.read();
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
