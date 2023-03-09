<template>
  <div id="app">
    <div class="basic-cont-box">
      <router-view />
    </div>
  </div>
</template>

<script>
  import store from '@/store'
  import {sendRouter, getToken} from '@/api/index'
  // constants
  import * as globalTypes from '@/store/types/global'
  export default {
    name: 'app',
    data() {
      return {}
    },
    watch: {},
    created() {
      let routerList = JSON.parse(sessionStorage.getItem('routerList'))
      // sendRouter(routerList) // 先暂时屏蔽发送本地路由
    },
    methods: {},
    computed: {}
  }
</script>
<style lang="scss">
  #app {
    width: 100%;
    height: 100%;
    overflow: hidden;
    overflow-y: auto;
    scrollbar-width: none; /* firefox */
    -ms-overflow-style: none; /* IE 10+ */
  }
  #app::-webkit-scrollbar {
    display: none; /* Chrome Safari */
  }
  ul, li {
    list-style: none;
  }
  .basic-cont-box{
    padding: 8px 10px;
    position: relative;
    height: 100%;
    box-sizing: border-box;
  }
</style>
<style lang="scss" scoped>
  .theme-text{
    position: fixed;
    right: 0;
    top: 50%;
    z-index: 9999999999999;
  }
  .theme-box {
    width: 100%;
    height: 100%;
  }
</style>
