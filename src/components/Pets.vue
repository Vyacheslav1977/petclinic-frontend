<template>
  <div class="pets">
    <div class="container-fluid">
      <div class="row">
        <div class="btn-add-new p-2 col-8"><b-button v-b-modal.modal-pet-edit>Добавить нового питомца</b-button></div>
        <div class="p-2 col-4 search-area">
          <input class="form-control" type="search" placeholder="Поиск: начните вводить текст..." aria-label="Search" v-model="searchValue" @input="quickSearch">
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
            @keyup.enter="handleSubmit"
            style="display: inline-block; margin-right: 8px; width: calc(100% - 120px);"
          ></b-form-input>
          <b-button style="margin-top: -4px; width: 112px;" @click="handleSubmit">{{ id ? 'Изменить' : 'Сохранить' }}</b-button>
        </b-form-group>
        <div class="mt-3" style="display: inline-block; margin-right: 8px;">Владелец: {{ client ? client.name : id ? 'не выбран' : '[можно будет выбрать после сохранения]' }}</div>
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
      <p class="entity" v-for="client in clients" :key="client.id">
        <span :class="client.pet && client.pet.id===id ? 'selected' : ''" @click="setClient(client)">
          <b>{{ client.name }}</b> (id: {{ client.id }})
          [<i>{{ client.pet && client.pet.id ? client.pet.name : '*питомец не назначен*' }}</i>]
        </span>
      </p>
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
  props: {
    savedSearchValue: String,
  },
  data() {
      //window.pets = this;
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
      this.api = new Api(this);
      this.searchValue = this.savedSearchValue;
    },

    async mounted() {
      await this.loadPets();
    },

    watch: {
      searchValue(v) {
        this.$emit('setSearchValue', v);
      },
    },

    methods: {
      setClient(client) {
        if (this.client === null || this.client.id !== client.id) {
          this.client = client;
          this.handleSubmit();
        }
        this.clients = [];
        this.closeClientsWindow();
      },

      closeClientsWindow() {
        this.$bvModal.hide('modal-client-prevent-closing');
      },

      quickSearch: debounce(async function() {
        if (!this.searchValue) {
          this.loadPets();
          return;
        }
        this.pets = await this.api.pets.search({name: this.searchValue});
      }, debounceDelayMs),

      async loadPets() {
        if (this.searchValue) {
          this.quickSearch();
          return;
        }
        this.pets = await this.api.pets.read();
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

      async handleSubmit() {
        if (!this.checkFormValidity()) {
          return
        }
        if (this.id === null) {
          const res = await this.api.pets.create({name: this.name});
          if (res && res.id) {
            this.$bvModal.msgBoxOk(`${res.name} (id: ${res.id})`, {
              title: 'Новый питомец создан',
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
          await this.api.pets.update({id: this.id, name: this.name, client: this.client === null ? null : this.client.id});
          this.$bvModal.msgBoxOk('Изменения сохранены', {
            size: 'sm',
            buttonSize: 'sm',
            okVariant: 'success',
            headerClass: 'p-2 border-bottom-0',
            footerClass: 'p-2 border-top-0',
            centered: true
          });
        }
        this.hidePetsWindow();
        await this.loadPets();
      },

      async deletePet() {
        this.$bvModal.msgBoxConfirm(`Удалить питомца "${this.name}"?`, {
          size: 'sm',
          buttonSize: 'sm',
          okVariant: 'danger',
          okTitle: 'Удалить',
          cancelTitle: 'Отмена',
          centered: true
        })
        .then(async (value) => {
          if (value) {
            await this.api.pets.delete(this.id);
            this.hidePetsWindow();
            await this.loadPets();
          }
        })
        .catch(err => {});
      },

      resetClientModal() {},

      handleClientOk(bvModalEvent) {
        bvModalEvent.preventDefault();
        this.handleSubmit();
      },

      async loadClients() {
        this.clients = await this.api.clients.read();
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
