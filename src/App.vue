<template>
  <div id="app">
    <header>
    <div class="container-fluid mt-0 mb-4">
      <div class="row">
        <div class="logo logo-left col-4"><img src="/logo-pets-left.png"/></div>
        <div class="col-4 sitename"><div class="sitename-text">Клиника домашних животных</div></div>
        <div class="logo logo-right col-4"><img src="/logo-pets-right.png"/></div>
      </div>
    </div>
    </header>

    <nav>
      <div class="nav nav-tabs">
        <a class="nav-item nav-link" :class="{active: clientsIsActive}" href="#clients" @click="selectClients">Клиенты</a>
        <a class="nav-item nav-link" :class="{active: petsIsActive}" href="#pets" @click="selectPets">Питомцы</a>
      </div>
    </nav>

    <Clients v-if="clientsIsActive"/>
    <Pets v-if="petsIsActive"/>
      
    <div class="spinner-area" :style="{visibility: spinnerVisibility}">
      <div class="spinner-border text-primary spinner-body" role="status"></div>
    </div>

  </div>
</template>

<script>
import Clients from '@/components/Clients.vue';
import Pets from '@/components/Pets.vue';

let spinnerStartTime;
const spinnerDelayMs = 200; // если запрос выполнился быстрее, чем это время, то спиннер не появится

export default {
  name: 'App',
  components: {
    Clients,
    Pets,
  },
  data() {
    window.app = this;
    return {
      clientsIsActive: true,
      petsIsActive: false,
      spinnerVisibility: 'hidden',
    }
  },
  created() {
    window.vm = this;
  },
  methods: {
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
</style>
