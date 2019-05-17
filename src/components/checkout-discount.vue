<template>
    <div class="checkout">
       
        <div class="discounts">
            <header>优惠券</header>
            <div class="youhuijine">
                您已选中优惠券1张，共可抵用¥50
            </div>
        <div class="all_coupons" ref='top'>

            <!-- 最佳选择的优惠券 -->
            <div class="best-coupons">
                <div class="coupon" v-for="(item,idx) in best_coupon" v-bind:key=item.coupons_id  @click="BestCoupon(item)">
                    <div class="couponleft">
                         <div class="coupon-left">
                            <p class="sum"><i>￥</i>{{item.money}}</p>
                            <p class="amanjian">{{item.coupons_name}}</p>
                        </div>
                    </div>
                   
                    <div class="coupon-right">
                        <p class="coupon-shop"></p>
                        <p class="coupon-time">{{item.expiration}}</p>
                        <span class="best-choose" ref='choosebest'></span>
                    </div>
                </div>
            </div>

            <!-- 可以用的券 -->
            <div class="coupons">
                <div class="coupon" v-for="(item,idx) in spendable_list" v-bind:key=idx @click="Addcoupon(item,idx)">
                    <div class="couponleft">
                         <div class="coupon-left">
                            <p class="sum"><i>￥</i>{{item.money}}</p>
                            <p class="amanjian">{{item.coupons_name}}</p>
                        </div>
                    </div>
                   
                    <div class="coupon-right">
                        <p class="coupon-shop"></p>
                        <p class="coupon-time">{{item.expiration}}</p>
                        <span class="coupon-choose" ref='chooseone'>
                            
                        </span>
                        
                    </div>
                </div>
            </div>
            <!-- 不能用的券 -->
            <div class="unable-coupons">
                <div class="u-coupon" v-for="(item,idx) in unusable_list" v-bind:key=item.coupons_id>
                    <div class="couponleft">
                         <div class="coupon-left">
                            <p class="sum"><i>￥</i>{{item.money}}</p>
                            <p class="amanjian">{{item.coupons_name}}</p>
                        </div>
                    </div>
                   
                    <div class="coupon-right">
                        <p class="coupon-shop"></p>
                        <p class="coupon-time">{{item.expiration}}</p>
                        <span class="coupon-choose"></span>
                        <p class="explain">未达到使用要求</p>
                    </div>
                </div>
            </div>
        </div>

        </div>
        <div class="confirm-box">
            <a class="confirm" @click="Confirm">确定</a>
        </div>
    </div>
</template>
<script>
import { NewArrObj } from '../utils/common.js'
import { parse } from 'querystring';
import '../styles/common.css'
import { constants } from 'fs';
import { isArray } from 'util';
export default {
   data(){
       return{
           list:[],
           sums:'',
           spendable_list:[],
           unusable_list:[],
           flag:true,
           best_coupon:[],
           checkList:[],
           id:[],
           isok:false,
           
           
       }
   },
   watch:{
       id:function(a,b){
        console.log(a);
        // this.isAccessTo(a)
         if(this.id.length != 0){
            this.$refs.nochoose.style.backgroundPositionX = 18 + 'px';
         }
         if(this.best_coupon.length == 0){
            this.$refs.nochoose.style.backgroundPositionX = 0;
         }
       },
   },
  
   props:['couponlist','sum','spendable_coupons','recommend_coupon'],
   created(){
       this.best_coupon = this.recommend_coupon;
       this.spendable_list = NewArrObj(this.spendable_coupons,this.best_coupon);
       this.id.unshift(this.best_coupon[0].coupons_id) 
       this.list = JSON.parse(JSON.stringify(this.couponlist))
       this.unusable_list = NewArrObj(this.couponlist,this.spendable_coupons);
       
       if(this.sum == ''){
           this.best_coupon = []
           this.spendable_list = [];
           this.unusable_list = this.list;
           this.flag = false
       }

    
   },
   mounted(){
       this.isThreshold()
   },
   updated(){
       let arr = [];
       for(var i = 0; i < this.couponlist.length; i ++){
           for(var j = 0; j < this.id.length; j ++){
               if(this.couponlist[i].coupons_id == this.id[j]){
                   arr.push(this.couponlist[i]);
               }
           }
       }
       for(var a = 0; a < this.spendable_list.length; a ++){
           for(var b = 0; b < arr.length; b ++){
               if(this.spendable_list[a].coupons_id == arr[b].coupons_id){
                   this.$refs.chooseone[a].style.backgroundPositionX = 0;
               }else{
                   this.$refs.chooseone[a].style.backgroundPositionX = 18 + 'px'
               }
           }
       }
       if(this.id.length = 0){
           this.$refs.choosebest[0].style.backgroundPositionX = 18 + 'px'
       }
        for(var i = 0; i < this.spendable_list.length; i ++){
           this.spendable_list[i].ischecked = false;
       }
   },
   methods:{
    
    // 是否选择最好那张优惠券
    BestCoupon(item){
        if(!item.ischecked){
            this.$refs.choosebest[0].style.backgroundPositionX = 0;
            this.id.push(item.coupons_id);
            
        }else{
            this.$refs.choosebest[0].style.backgroundPositionX = 18 + 'px';
            for(let a = 0; a < this.id.length; a ++){
                    if(this.id[a] == item.coupons_id){
                        this.id.splice(a,1)
                    }
                }
               
        }
        item.ischecked = !item.ischecked
        this.isThreshold()
    },

    // 判断最佳优惠是否是有门槛
    isThreshold(){
        if(this.best_coupon[0].is_threshold == 2){
            for(var i = this.spendable_list.length-1; i >= 0; i --){
                if(this.spendable_list[i].is_threshold == 2){
                    this.unusable_list.push(this.spendable_list[i]);
                    this.spendable_list.splice(i,1);
                }
            }
        }
    },
   
    // 判断是否有门槛
    Addcoupon(item,idx){
        let spendable_coupons = [...NewArrObj(this.spendable_coupons,this.recommend_coupon)];
        let best_coupon = this.best_coupon;
        let unusable_list = [...NewArrObj(this.couponlist,this.spendable_coupons)];
        if(item.ischecked == false){
            
            if(item.is_threshold == 2){
                let idx = spendable_coupons.indexOf(item);
                for(var i = spendable_coupons.length-1; i >= 0; i --){
                    if(spendable_coupons[i].is_threshold == 2){
                        if(spendable_coupons[i].coupons_id == item.coupons_id){
                            spendable_coupons.splice(i,1)
                        }else{
                            unusable_list.unshift(spendable_coupons[i]);
                            spendable_coupons.splice(i,1)
                        }
                    }
                }
                if(best_coupon[0].is_threshold == 2){
                    unusable_list.push(best_coupon[0]);
                    this.id = [];
                }else{
                    spendable_coupons.unshift(best_coupon[0])
                }
               
               
                this.$refs.choosebest[0].style.backgroundPositionX = 0;
                this.id.push(item.coupons_id)
                this.unusable_list = unusable_list
                this.spendable_list = spendable_coupons;
                this.best_coupon = [item];
            }else{
                this.id.push(item.coupons_id);
                this.$refs.chooseone[idx].style.backgroundPositionX = 0;
            }
            item.ischecked = !item.ischecked;
        }else{
            if(item.is_threshold == 2){
                this.spendable_list = this.spendable_coupons;
                this.best_coupon = this.recommend_coupon;
                this.unusable_list = [...NewArrObj(this.couponlist,this.spendable_coupons)];
                
            }else{
                this.$refs.chooseone[idx].style.backgroundPositionX = 18 + 'px';
                for(let a = 0; a < this.id.length; a ++){
                    if(this.id[a] == item.coupons_id){
                        this.id.splice(a,1)
                    }
                }
               
            }
             item.ischecked = !item.ischecked;
        }
        

        document.querySelectorAll('.all_coupons')[0].scrollTop = 0;
        

    
    },

    // 点击确定
    Confirm(){
        console.log(this.id)
        this.$emit('ListenToCoupon',this.id)
    }
    
   }
}
</script>
<style scoped>
    .checkout{
        position: fixed;
        bottom: 0;
        width: 100vw;
        height: auto;
        /* overflow: hidden; */
        /* width: 100vw;
        height: 100vh; */
        
    }
    .discounts::after{
        content: ".";
        clear: both;
        display: block;
        overflow: hidden;
        font-size: 0;
        height: 0;
        zoom: 1;
    }
   
    .discounts{
        position: absolute;
        bottom: 0;
        width: 100vw;
        background: #f6f6f6;
        max-height: 462px;
    }
    .checkout header{
        font-size: 15px;
        background: #fff;
        text-align: center;
        height: 49px;
        line-height: 49px;
        width: 100vw;
    }
    .youhuijine{
        height: 49px;
        width: 100%;
        background: #FDE8E5;
        font-size: 12px;
        line-height: 45px;
        padding-left: 23px;
    }
    .choose{
        float: right;
        display: block;
        width: 18px;
        height: 18px;
        margin-top: .15rem;
        margin-right: .28rem;
        background: url('../assets/icons.png');
        background-position: 18px 0;
       
    }
    .all_coupons{
        overflow: auto;
        max-height: 3.24rem;
        margin-bottom: 10px;
    }
    /* .coupons{
       
    } */
    .coupon{
        width: 3.51rem;
        height: .98rem;
        float: left;
        margin-top: 10px;
        margin-left: 11px;
        background: url(../assets/coupon.png) no-repeat;
        background-size: 100%;
        position: relative;
    }
    .u-coupon{
        width: 3.51rem;
        height: .98rem;
        float: left;
        margin-top: 10px;
        margin-left: 11px;
        background: url(../assets/nouse-coupon.png) no-repeat;
        background-size: 100%;
        position: relative;
    }
    .couponleft{
        width: 1.24rem;
        height: .98rem;
        position: absolute;
        top: 0;
        left: 0;
    }
    .coupon-left{
        color: #fff;
        width: .73rem;
        height: auto;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%)
    }
    .coupon-left i{
        font-size: .17rem;
    }
    .coupon-left .sum{
        font-size: .35rem;
        line-height: .35rem;
    }
    .coupon-left .amanjian{
        font-size: .12rem;
    }
    .coupon-right{
        position: absolute;
        left: 1.24rem;
        top: 0;
        height: .99rem;
        width: 2.28rem;
    }
    .coupon-shop{
        font-size: .14rem;
        font-weight: bold;
        position: absolute;
        top: .12rem;
        left: .62rem;
    }
    .explain{
        font-size: .12rem;
        color: #999999;
        position: absolute;
        left: .2rem;
        top: .7rem
    }
    .coupon-time{
        font-size: .12rem;
        color: #999999;
        position: absolute;
        top: .35rem;
        left: .20rem;
    }
    .coupon-choose{
        display: block;
        position: absolute;
        width: 18px;
        height: 18px;
        left: 1.95rem;
        top: .45rem;
        background: url('../assets/icons.png');
        background-position-x: 18px;
    }
    
    .best-choose{
        display: block;
        position: absolute;
        width: 18px;
        height: 18px;
        left: 1.95rem;
        top: .45rem;
        background: url('../assets/icons.png');
         background-position-x: 0;
    }

    .confirm-box{
        position: fixed;
        bottom: 0;
        width: 100%;
        height: .8rem;
        font-size: .15rem;
        color: #fff;
        background: #fff;
        padding-left: .15rem;
        padding-top: .16rem;
    }
    .confirm{
        color: #fff;
        display: block;
        width: 3.45rem;
        height: .45rem;
        background:linear-gradient(90deg,rgba(255,148,20,1),rgba(254,134,88,1),rgba(255,23,9,1));
        border-radius:5px;
        text-align: center;
        line-height: .45rem;
    }
    
</style>
