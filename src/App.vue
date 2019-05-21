<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import './utils/rem.js'
import './styles/base.css'
import './styles/common.css'
export default {
  name: 'App',
  created(){
  }
}
</script>

<style>
body,html{
  height: 100%;
   -webkit-user-select:none;
    -moz-user-select:none;
    -ms-user-select:none;
    user-select:none;
}
#app{
  height: 100%;
}
</style>
