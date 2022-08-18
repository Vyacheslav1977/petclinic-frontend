import Vue from 'vue';
import { BootstrapVue, TablePlugin, ButtonPlugin, ModalPlugin, NavPlugin } from 'bootstrap-vue';
import App from './App.vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);
Vue.use(TablePlugin);
Vue.use(ButtonPlugin);
Vue.use(ModalPlugin);
Vue.use(NavPlugin);

Vue.config.productionTip = false;

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app');

