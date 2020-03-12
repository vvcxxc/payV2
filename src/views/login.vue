<template>
  <div class="login-page">
    <div class="logo-box">
      <img src="../assets/login.png" />
      <div>登录账号后即可同步卡券</div>
    </div>
    <div class="login-main">
      <div class="input-box">
        <div class="input-label">+86 |</div>
        <input type="phone" v-model="phone" placeholder="请输入手机号" />
        <div class="code-button">
          <div v-if="is_code" @click="getPhoneCode">发送验证码</div>
          <div v-if="!is_code" class="code-secend">
            <van-count-down :time="60000" format="ss" @finish="is_code = true" />s后重新获取
          </div>
        </div>
      </div>
      <div class="input-box">
        <div class="input-label">验证码</div>
        <input type="text" placeholder="请输入验证码" v-model="code" maxlength="6">
      </div>
    </div>
    <div style="width: 100%; padding: 0 .12rem">
      <div class="login-button" @click="login">登录</div>
    </div>
  </div>
</template>
<script>
import { phoneLogin, getCode } from "../api/api_user";
import { Toast } from "vant";

import { getBrowserType } from "../utils/get_info";
export default {
  data() {
    return {
      phone: "",
      is_code: true,
      time: 60,
      code: ""
    };
  },
  methods: {
    getPhoneCode() {
      if (/^1[3456789]\d{9}$/.test(Number(this.phone))) {
        getCode(this.phone).then(res => {
          if (res.status_code == 200) {
            Toast.success(res.message);
            this.is_code = false;
          } else {
            Toast.fail(res.message);
          }
        });
      } else {
        Toast.fail("请输入正确的手机号");
      }
    },
    login() {
      if (this.phone && this.code) {
        let type = getBrowserType == "wechat" ? "wx" : "ali";
        phoneLogin({
          phone: this.phone,
          verify_code: this.code,
          from: type
        }).then(res => {
          if (res.status_code == 200) {
            Toast.success("登录成功");
            
            let url = localStorage.getItem("url");
            encodeURIComponent(url)
            location.href =
              process.env.VUE_APP_USER_API +
              "/v1/user/auth/relogin?phone=" +
              this.phone +
              "&verify_code=" +
              this.code +
              "&url=" +
              url +
              "&from=" +
              type;
          }
        });
      }
    }
  }
};
</script>
<style lang="sass" scoped>
@import "./login.scss"
</style>
