<template>
  <div class="login-page">
    <div class="logo-box">
      <img src="../assets/login.png">
      <div>登录账号后即可同步卡券</div>
    </div>
    <div class="login-main">
      <div class="input-box">
        <div class="input-label">+86 |</div>
        <input type="phone" placeholder="请输入手机号" />
        <div class="code-button">
          <div v-if="is_code" @click="is_code = false">发送验证码</div>
          <van-count-down v-if="!is_code" :time="60000" format="ss"  @finish="is_code = true" />
        </div>
      </div>
      <div class="input-box">
        <div class="input-label">验证码</div>
        <input type="text" placeholder="请输入验证码" />
      </div>
    </div>
    <div style="width: 100%; padding: 0 .12rem">
      <div class="login-button">登录</div>
    </div>

  </div>
</template>
<script>
  export default {
    data() {
      return {
        phone: '',
        is_code: true,
        time: 60
      };
    },
    methods: {
    }
  }
</script>
<style lang="sass" scoped>
  @import "./login.scss"
</style>
