<template>
  <div id="app">
    <header>
    <div class="container-fluid mt-0 mb-4">
      <div class="row">
        <div class="logo logo-left col-6 order-2 col-md-4 order-md-1"><img src="/logo-pets-left.png"/></div>
        <div class="sitename col-12 order-1 col-md-4 order-md-2"><div class="sitename-text">Клиника домашних животных</div></div>
        <div class="logo logo-right col-6 order-3 col-md-4 order-md-3"><img src="/logo-pets-right.png"/></div>
      </div>
    </div>
    </header>

    <nav>
      <div class="nav nav-tabs">
        <a class="nav-item nav-link" :class="{active: clientsIsActive}" href="#clients" @click="selectClients">Клиенты</a>
        <a class="nav-item nav-link" :class="{active: petsIsActive}" href="#pets" @click="selectPets">Питомцы</a>
        <a class="nav-item nav-link" href="#test" @click="testError">Тест ошибки</a>
      </div>
    </nav>

    <Clients v-if="clientsIsActive" ref="clients" :savedSearchValue="searchValues.clients" @setSearchValue="(v) => searchValues.clients = v"/>
    <Pets v-if="petsIsActive" :savedSearchValue="searchValues.pets" @setSearchValue="(v) => searchValues.pets = v"/>
      
    <div class="spinner-area" :style="{visibility: spinnerVisibility}">
      <div class="spinner-border text-primary spinner-body" role="status"></div>
    </div>

    <Alerts ref="alerts"/>
  </div>
</template>

<script>
import Alerts from '@/components/Alerts.vue';
import Clients from '@/components/Clients.vue';
import Pets from '@/components/Pets.vue';

let spinnerStartTime;
const spinnerDelayMs = 200; // если запрос выполнился быстрее, чем это время, то спиннер не появится

export default {
  name: 'App',
  components: {
    Alerts,
    Clients,
    Pets,
  },
  data() {
    //window.app = this;
    return {
      searchValues: {
        clients: '',
        pets: '',
      },
      clientsIsActive: true,
      petsIsActive: false,
      spinnerVisibility: 'hidden',
    }
  },
  created() {
    window.vm = this;
  },
  methods: {
    async testError() {
      await this.$refs.clients.api.clients.testError();
    },
    selectClients() {
      this.clientsIsActive = true;
      this.petsIsActive = false;
    },
    selectPets() {
      this.clientsIsActive = false;
      this.petsIsActive = true;
    },
    showSpinner() {
      spinnerStartTime = Date.now();
      setTimeout(() => {
        if (spinnerStartTime < Date.now()) this.spinnerVisibility = 'visible';
      }, spinnerDelayMs); // выводим спиннер только, если запрос выполняется дольше spinnerDelayMs мс (не учитывается несколько параллельных запросов - для этого нужно отслеживать каждый спиннер по-отдельности)
    },
    hideSpinner() {
      this.spinnerVisibility = 'hidden';
      spinnerStartTime = Date.now() + spinnerDelayMs;
    },
  },
}
</script>

<style>
h1 {
  text-align: center;
}
.logo {
  
}
.logo > img {
  height: inherit;
}
.logo-right {
  text-align: right;
}
.sitename {
  display: table;
}
.sitename-text {
  display: table-cell;
  font-size: 36px;
  text-align: center;
  vertical-align: middle;
}
.spinner-area {
  background-color: #fff;
  height: 100vh;
  left: 0;
  opacity: 0.4;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 999999;
}
.spinner-body {
  left: 50vw;
  position: absolute;
  top: 50vh;
}
.col-6 {
  height: 70px;
}
.col-12 > .sitename-text {
  font-size: 20px;
  height: auto;
  padding: 20px;
}

@media (min-width: 480px) {
  .col-md-4 {
    height: 100px;
  }
  .col-md-4 > .sitename-text {
    font-size: 24px;
  }
}

@media (min-width: 768px) {
  .col-md-4 {
    height: 120px;
  }
  .col-md-4 > .sitename-text {
    font-size: 28px;
  }
}

@media (min-width: 1200px) {
  .col-md-4 {
    height: auto;
  }
  .col-md-4 > .sitename-text {
    font-size: 36px;
  }
}
</style>
