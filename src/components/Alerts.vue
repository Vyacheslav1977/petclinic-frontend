<template>
  <div class="alerts">
    <div class="alert" v-for="alert in alerts" :key="alert.key">
      <div class="close-btn" @click="alert.close()" title="убрать уведомление">x</div>
      <div class="body" v-html="alert.html"></div>
    </div>
  </div>
</template>

<script>
// todo: добавить немного анимации при появлении и закрытии уведомлений
let key = 0;

class Alert {
  constructor(html = '', vm = null) {
    this.key = ++key;
    this.html = html;
    this.vm = vm;
  }
  close() {
    this.vm.alerts.splice(this.vm.alerts.findIndex(i => i.key===this.key), 1);
  }

}

export default {
  name: 'Alerts',
  data() {
    //window.alerts = this;
    return {
      alerts: [],
    }
  },
  methods: {
    add(html) {
      this.alerts.push(new Alert(html, this));
    },
  },
}
</script>


<style scoped>
.alerts {
  display: flex;
  flex-direction: column-reverse;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 9999999;
}
.alert {
  background-color: #f8d7da;
  border: 2px solid #842029;
  color: #842029;
  margin: 10px 10px 0 0;
  min-height: 100px;
  min-width: 200px;
  padding: 10px;
}
.close-btn {
  border: 2px solid #842029;
  cursor: pointer;
  display: inline;
  padding: 0 6px;
  position: absolute;
  right: 10px;
  top: 5px;
}
</style>
