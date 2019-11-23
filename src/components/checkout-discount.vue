<template>
  <div class="checkout">
    <div class="checkout-header">
      优惠信息
    </div>
    <div class="money_off">
      <i class="icon"/>
      <div v-for="(value,key) in money_off_list" :key='key'>
        <span>满{{key}}减{{value}}</span>
      </div>
    </div>
  </div>
</template>
<script>
import { NewArrObj, Compare, RemoveDup } from "../utils/common.js";
import store from "../store/index"
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      
    };
  },

  created() {
    
  },
  computed: {
    ...mapGetters(["coupon_list","money_off_list"])
  },

  mounted (){
    console.log(this.money_off_list)
  },

  methods: {
    //  点击确定，向父组件传值
    Confirm() {
      this.id = RemoveDup(this.id);
      this.$emit("ListenToCoupon", this.id, this.sums);
    }
  }
};
</script>
<style scoped lang='scss'>
.icon {
  background: url('../assets/icon.png') no-repeat;
  // background-size: 50%;
}
@import './checkout-discount.scss'

</style>
