<template>
  <div class="keyboard-box">
    <div class="number">
      <ul>
        <li v-for="(item,idx) in kb.first" :key="idx" @click="inputNum">{{item}}</li>
      </ul>
      <ul>
        <li v-for="(item,idx) in kb.second" :key="idx" @click="inputNum">{{item}}</li>
      </ul>
      <ul>
        <li v-for="(item,idx) in kb.third" :key="idx" @click="inputNum">{{item}}</li>
      </ul>
      <ul>
        <li style="width:1.82rem"  @touchend="inputNum">0</li>
        <li  @click="inputNum">.</li>
      </ul>
    </div>
    <div class="confirm">
      <ul class="pay-confirm">
        <li @click="backSpace"><img src="../assets/tuige.png" alt=""></li>
        <li class="queding" @click="toPay">确定</li>
      </ul>
    </div> 
  </div>
</template>
<script>
import { getUrlParams, getBrowserType } from '../utils/get_info';
import { Cookie } from '../utils/common';
import { requestWechatPayment, storeInfo } from '../api/api';

export default {
  data(){
    return {
      kb: {
        first: ['1', '2', '3'],
        second: ['4', '5', '6'],
        third: ['7', '8', '9'],
      },
      currentValue: '',
      showSum:false,
      amounts:'',
      id:[],
      activity:[]
    }
  },
  props:['sum','amount','coupon_id','is_reduction_removed'],
  watch:{
    sum:function(newVal,oldVal){
      this.currentValue = newVal
    },
    amount:function(a,b){
      this.amounts =a;
    },
    coupon_id:function(a,b){
      this.id = a
    },
    is_reduction_removed:function(a,b){
      this.activity = a;
    }
  },
  methods:{
      inputNum (ev) {
          let kb = ev.target.innerText

          switch (true) {
            case kb == '.' && this.currentValue.length == 0:

              this.currentValue = '0.'
              break;
            case kb == '.' && !!~this.currentValue.indexOf('.'):

              break;
            default:
              this.currentValue += kb
          }
          
          // console.log(this.currentValue)
          this.$emit('change-sum', this.currentValue , this.showSum)
      },
      // 回退
      backSpace () {
        let tempCurrentValue = [].slice.call(this.currentValue)

        switch (true) {
          case tempCurrentValue.length == 0:
            this.amount = '';
            break;
          default:
            tempCurrentValue.pop()
            this.currentValue = tempCurrentValue.join('')
        }
       
        this.$emit('change-sum', this.currentValue , this.showSum)
      },

      // 点击支付
      async toPay(){
        let browsertype = getBrowserType();
        let code_id = getUrlParams().code_id;
        let amount = this.sum;
        let result_money = this.amounts;
        let is_activities = this.activity;
        
        let youhui_log_id = this.id.join('_')
        
       
        if(browsertype == 'wechat'){
          // 微信支付
          let open_id = Cookie.get(process.env.VUE_APP_OPEN_ID);
          let params = {
            code_id,
            amount, 
            youhui_log_id,
            open_id,
            is_activities,
            result_money,
          }
          var {data} = await requestWechatPayment(params)

            WeixinJSBridge.invoke(
                'getBrandWCPayRequest', {
                  "appId":data.appId,
                  "timeStamp":data.timeStamp, 
                  "nonceStr":data.nonceStr,  
                  "package":data.package,
                  "signType":data.signType,   
                  "paySign":data.paySign
                },
                function(res){
                if(res.err_msg == "get_brand_wcpay_request:ok" ){
                console.log('支付成功')
                } 
            });

        }else if(browsertype == 'alipay'){
          // 支付宝支付
         
          let alipayUuser = Cookie.get('alipayUuser')
          let params = {
            code_id,
            amount,
            youhui_log_id,
            alipay_user_id:alipayUuser,
            is_activities,
            result_money
          }
          var {data} = await requestWechatPayment(params);
          window.AlipayJSBridge.call('tradePay', {
              tradeNO: data.alipayOrderSn
            }, res => {
              if (res.resultCode === "9000") {
                return resolve({
                  message: 'ok'
                })
              } else if (res.resultCode === "4000") {
                return reject({
                  message: 'error',
                  error: res
                })
              }
            })
          }
        }
      }

  }
 

</script>
<style>
  .keyboard-box{
    width: 100%;
  }
	li{
		font-size: .17rem;
    float: left;
    line-height: .5rem;
    width: .89rem;
    /* height: .5rem; */
    height: .5rem;
    background: #fff;
    text-align: center;
    margin: .05rem 0 0 .05rem;
    border-radius: .03rem;
	}
  ul::after{
    content: ".";
    clear: both;
    display: block;
    overflow: hidden;
    font-size: 0;
    height: 0;
  }
  .number{
    float: left;
  }
  .confirm{
    float: left;
  }
  .confirm li{
    float: none;
    width: .81rem;
    height: 1.07rem;
    line-height: 1.07rem;
  }
  .confirm li img{
    width: .26rem;
    pointer-events: none
  }
  .queding{
    background: #ff9500;
    color: #fff;
    font-weight: bold;
  }
  .confirm,.number{
    margin-bottom: .05rem;
  }

</style>
