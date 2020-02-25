import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 引入全局样式表
import './assets/css/global.css'
// 引入字体样式表
import './assets/font-awesome-4.7.0/css/font-awesome.min.css'
// 引入 axios
import axios from 'axios'
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem("token")
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 树形 控件
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
