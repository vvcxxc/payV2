<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import './utils/rem.js'
import './styles/base.css'
import './styles/common.css'
import {Login} from './utils/handle_login';
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
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none; 
  -webkit-tap-highlight-color:rgba(0,0,0,0);
  /* font-family: "PingFang SC Light","Heiti SC","San Francisco","Helvetica"; */
}
#app{
  height: 100%;
}
</style>
