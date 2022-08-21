import Vue from 'vue';
import {
  BootstrapVue,
  ButtonPlugin,
  ModalPlugin,
  NavPlugin,
  TablePlugin,
} from 'bootstrap-vue';
import App from './App.vue';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);
Vue.use(ButtonPlugin);
Vue.use(ModalPlugin);
Vue.use(NavPlugin);
Vue.use(TablePlugin);

Vue.config.productionTip = false;

new Vue({
  render: function (h) { return h(App) },
}).$mount('#app');

