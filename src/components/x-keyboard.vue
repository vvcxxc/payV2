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
import { requestWechatPayment, requestAlpayPayment } from '../api/api';

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
      activity:[],
    }
  },
  props:['sum','amount','coupon_id','is_reduction_removed','storename'],
  watch:{
    sum:function(newVal){
      this.currentValue = newVal
    },
    amount:function(a){
      this.amounts = a;
    },
    coupon_id:function(a){
      this.id = a
    },
    is_reduction_removed:function(a){
      this.activity = a;
    },
    currentValue:function(a,b){
      if(a > 100000){
        this.currentValue = b
      }
    },
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
            case kb == '0' && this.currentValue.length == 0:
              this.currentValue = '0.'
              break;
            default:
              this.currentValue += kb
          }
           let idx = this.currentValue.indexOf('.');
           if(idx > 0){
             if(this.currentValue.length > idx*1+2){
              this.currentValue = this.currentValue.substring(0,idx*1+3);
            }
          
           }
            
          // console.log(this.currentValue)
          this.$emit('change-sum', this.currentValue , this.showSum)
      },
      // 回退
      backSpace () {
        let tempCurrentValue = [].slice.call(this.currentValue)

        switch (true) {
          case tempCurrentValue.length == 0:
            this.currentValue = '';
            break;
          default:
            tempCurrentValue.pop()
            this.currentValue = tempCurrentValue.join('')
        }
       
        this.$emit('change-sum', this.currentValue , this.showSum)
      },

      // 点击支付
      async toPay(){
        let _this = this
        let browsertype = getBrowserType();
        let code_id = getUrlParams().code_id;
        let amount = this.sum;
        let result_money = this.amount;
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
          var {data} = await requestWechatPayment(params);
          var order_sn = data.order_sn;
          let message = {
            order_sn,
            store_name:this.storename,
            browsertype,
            amount,
            result_money
          }

          if(result_money){
             window.WeixinJSBridge.invoke(
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
                _this.$router.push({name:'activity',params:message})
                } 
            });
          }else {
            this.$router.push({name: 'activity', params:message})
          }
        }else if(browsertype == 'alipay'){
          // 支付宝支付
         
          let alipayUuser = Cookie.get(process.env.VUE_APP_ALIPAYID)
          let params = {
            code_id,
            amount,
            youhui_log_id,
            alipay_user_id:alipayUuser,
            is_activities,
            result_money
          }
          let {data} = await requestAlpayPayment(params);
          let order_sn = data.order_sn;
          let message = {
            order_sn,
           store_name:this.storename,
            browsertype,
            amount,
            result_money
          }
          if(result_money){
            window.AlipayJSBridge.call('tradePay', {
              tradeNO: data.alipayOrderSn
            }, res => {
              if (res.resultCode === "9000") {
                _this.$router.push({name:'activity',params:message})
                return ({
                  message: 'ok'
                  
                })
              } else if (res.resultCode === "4000") {
                return ({
                  message: 'error',
                  error: res
                })
              }
            })
          }else{
            this.$router.push({name: 'activity', params:message});
          }
          
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
  li:active{
    background: #eeeeee;
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
