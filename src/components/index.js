import Vue from 'vue'
import basicContainer from './basic-container/main'
import zebraForm from './basic-assembly/form'
import zebraTable from './basic-assembly/table'
import zebraTab from './basic-assembly/tab'
import zebraButton from './basic-assembly/button'
import zebraFormLevel from './basic-assembly/levelForm'
import zebraFromStep from './basic-assembly/stepForm'
import childrenTable from './basic-assembly/childrenTable'
import titlePageHeader from './page-header/titlePageHeader'

// 注册全局容器
Vue.component('basicContainer', basicContainer)
Vue.component('zebra-form', zebraForm)
Vue.component('zebra-table', zebraTable)
Vue.component('zebra-tab', zebraTab)
Vue.component('zebra-button', zebraButton)
Vue.component('zebra-form-level', zebraFormLevel)
Vue.component('zebra-form-step', zebraFromStep)
Vue.component('zebra-children-table', childrenTable)
Vue.component('title-page-header', titlePageHeader)
Vue.component('title-page-header', titlePageHeader)
