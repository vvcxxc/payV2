<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import './utils/rem.js'
import './styles/base.css'
import './styles/common.css'
import {Login} from './utils/handle_login'
export default {
  name: 'App',
  created(){
    Login();
  }
}
</script>

<style>
body,html{
  height: 100%;
}
#app{
  height: 100%;
}
</style>
