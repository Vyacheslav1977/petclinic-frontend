<template>
  <div class="clients">
    <div class="container-fluid">
      <div class="row">
        <div class="btn-add-new p-2 col-8"><b-button v-b-modal.modal-client-edit>Добавить нового клиента</b-button></div>
        <div class="p-2 col-4 search-area">
          <input class="form-control" type="search" placeholder="Поиск: начните вводить текст..." aria-label="Search" v-model="searchValue" @input="quickSearch">
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
      hide-footer
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
            @keyup.enter="handleSubmit"
            style="display: inline-block; margin-right: 8px; width: calc(100% - 120px);"
          ></b-form-input>
          <b-button style="margin-top: -4px; width: 112px;" @click="handleSubmit">{{ id ? 'Изменить' : 'Сохранить' }}</b-button>
        </b-form-group>
        <div class="mt-3" style="display: inline-block; margin-right: 8px;">Питомец: {{ pet ? pet.name : id ? 'не выбран' : '[можно будет выбрать после сохранения]' }}</div>
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
      <p class="entity" v-for="pet in pets" :key="pet.id">
        <span :class="pet.client && pet.client.id===id ? 'selected' : ''" @click="setPet(pet)">
          <b>{{ pet.name }}</b> (id: {{ pet.id }})
          [<i>{{ pet.client && pet.client.id ? pet.client.name : '*владелец не назначен*' }}</i>]
        </span>
      </p>
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
  props: {
    savedSearchValue: String,
  },
  data() {
      //window.clients = this;
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
        testData: null,
        error: {},
      }
    },

    created() {
      this.api = new Api(this);
      this.searchValue = this.savedSearchValue;
    },

    async mounted() {
      await this.loadClients();
    },

    watch: {
      searchValue(v) {
        this.$emit('setSearchValue', v);
      },
    },

    methods: {
      setPet(pet) {
        if (this.pet === null || this.pet.id !== pet.id) {
          this.pet = pet;
          this.handleSubmit();
        }
        this.closePetsWindow();
        this.pets = [];
      },

      closePetsWindow() {
        this.$bvModal.hide('modal-pet-prevent-closing');
      },

      quickSearch: debounce(async function() {
        if (!this.searchValue) {
          this.loadClients();
          return;
        }
        this.clients = await this.api.clients.search({name: this.searchValue});
      }, debounceDelayMs),

      async loadClients() {
        if (this.searchValue) {
          this.quickSearch();
          return;
        }
        this.clients = await this.api.clients.read();
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

      async handleSubmit() {
        if (!this.checkFormValidity()) {
          return;
        }
        if (this.id === null) {
          const res = await this.api.clients.create({name: this.name});
          if (res && res.id) {
            this.$bvModal.msgBoxOk(`${res.name} (id: ${res.id})`, {
              title: 'Новый клиент создан',
              size: 'sm',
              buttonSize: 'sm',
              okVariant: 'success',
              headerClass: 'p-2 border-bottom-0',
              footerClass: 'p-2 border-top-0',
              centered: true
            });
          }
        }
        else {
          await this.api.clients.update({id: this.id, name: this.name, pet: this.pet === null ? null : this.pet.id});
          this.$bvModal.msgBoxOk('Изменения сохранены', {
            size: 'sm',
            buttonSize: 'sm',
            okVariant: 'success',
            headerClass: 'p-2 border-bottom-0',
            footerClass: 'p-2 border-top-0',
            centered: true
          });
        }
        this.hideClientsWindow();
        await this.loadClients();
      },

      async deleteClient() {
        this.$bvModal.msgBoxConfirm(`Удалить клиента "${this.name}"?`, {
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Удалить',
          cancelTitle: 'Отмена',
          centered: true
        })
        .then(async (value) => {
          if (value) {
            await this.api.clients.delete(this.id);
            this.hideClientsWindow();
            await this.loadClients();
          }
        })
        .catch(err => {});
      },

      resetPetModal() {},

      handlePetOk(bvModalEvent) {
        bvModalEvent.preventDefault();
        this.handleSubmit();
      },

      async loadPets() {
        this.pets = await this.api.pets.read();
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
  
  padding: 0 5px;
}
.entity > span {
  background-color: transparent;
  cursor: pointer;
  padding: 0 10px;
}
.entity > .selected {
  background-color: #bcc5cd;
}
.entity > span:hover {
  background-color: #b8d9ec;
}
</style>
