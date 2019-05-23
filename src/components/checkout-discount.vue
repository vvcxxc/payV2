<template>
    <div class="checkout">
       
        <div class="discounts">
            <header>优惠券</header>
            <div class="youhuijine">
                您已选中优惠券1张，共可抵用¥{{sums}}
            </div>
        <div class="coupons-box">
            <div class="all_coupons" ref='top'>

                <!-- 最佳选择的优惠券 -->
                <!-- <div class="best-coupons">
                    <div class="coupon" v-for="(item,idx) in best_coupon" v-bind:key=item.coupons_id @click="isBest(item,idx)">
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
                </div> -->

                <!-- 可以用的券 -->
                <div class="coupons">
                    <div v-bind:class="item.chooseable ? 'coupon' : 'u-coupon'" v-for="(item,idx) in list" v-bind:key=idx ref="couponbg" @click="item.chooseable && SortCoupons(item)">
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
                <!-- <div class="unable-coupons">
                    <div class="u-coupon" v-for="(item) in unusable_list" v-bind:key=item.coupons_id>
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
                </div> -->
            </div>
        </div>
        

        </div>
        <div class="confirm-box">
            <a class="confirm" @click="Confirm">确定</a>
        </div>
    </div>
</template>
<script>
import { NewArrObj, Compare, RemoveDup } from '../utils/common.js'
import '../styles/common.css';
export default {
   data () {
       return{
           list:[],
           sums:0,
           spendable_list:[],
           unusable_list:[],
           best_coupon:[],
           id:[]
       }
   },
   watch:{
       list:function(newVal,oldVal){
            for(var a = 0; a < newVal.length; a ++){
                this.$refs.chooseone[a].style.backgroundPositionX = 18 + 'px';
                if(newVal[a].ischecked == true){
                   this.$refs.chooseone[a].style.backgroundPositionX = 0;
                }
           }
           for(var i = 0; i < newVal.length; i ++){
               if(newVal[i].chooseable == 2){
                   this.$refs.couponbj[i].style.background = 'url(../assets/nouse-coupon.png)'
               }
           }
          
       },
       id:function(a,b){
           this.sums = 0;
           for(let i = 0; i < this.couponlist.length; i ++){
               for(let c = 0; c < a.length; c ++){
                   if(this.couponlist[i].coupons_id == this.id[c]){
                       this.sums += this.couponlist[i].money*1
                   }
               }
           }
       }
   },
   
  
   props:['couponlist','sum','spendable_coupons','recommend_coupon'],
   created(){
       if(this.spendable_coupons.length){
            this.unusable_list = NewArrObj(this.couponlist,this.spendable_coupons);
            this.spendable_list = NewArrObj(this.spendable_coupons,this.recommend_coupon);
            for(let i = 0; i < this.spendable_coupons.length; i ++){
                this.spendable_coupons[i].chooseable = 1;
            }
            this.best_coupon = this.recommend_coupon;
       }else{
            this.unusable_list = this.couponlist;
            for(let j = 0; j < this.unusable_list.length; j ++){
                this.unusable_list[j].chooseable = 0
                this.unusable_list[j].ischecked = false
            }
       }
      
       
       this.list = this.couponlist;
       if(this.sum == ''){
           this.unusable_list = this.list;
           this.best_coupon = [];
           this.spendable_list = [];
       }
       //默认选择最佳优惠
       this.Coupons();
   },

   methods:{

        // 初始化渲染
        Coupons(){
            this.list = [];
            this.recommend_coupon[0].ischecked = true;
            let best = this.recommend_coupon[0];
            let spendable = [...this.spendable_coupons];
            if(spendable.length){
                if(best.is_threshold == 2){
                    for(let i = 0; i < spendable.length; i ++){
                        if(best.coupons_id != spendable[i].coupons_id){
                            if(spendable[i].is_threshold == 2){
                                spendable[i].chooseable = 0;
                            }
                        }
                    }
                }
            spendable.sort(Compare('chooseable'));
            this.list = spendable;
            }
            
            for(let b = 0; b < this.unusable_list.length; b ++){
                this.list.push(this.unusable_list[b])
            };
           this.id.push(best.coupons_id);
        },

        // 选择优惠券(有待提高版)
        SortCoupons(item){
            this.list = [];//渲染此项
            let spendable = [...this.spendable_coupons];
            if(item.ischecked == false){
                // 选择
               
                item.ischecked = true;
                if(item.is_threshold == 1){
                    this.list.unshift(item);
                    for(let i = 0; i < spendable.length; i ++){
                        if(spendable[i].coupons_id == item.coupons_id){
                           spendable.splice(i,1);
                        }
                    }
                }else{
                    this.list.unshift(item);
                   for(let i = spendable.length-1; i >= 0; i --){
                        if(spendable[i].coupons_id == item.coupons_id){
                            spendable.splice(i,1);
                        }
                    }
                    for(let i = spendable.length-1; i >= 0; i --){
                        if(spendable[i].is_threshold == 2){
                            spendable[i].ischecked = false;
                            spendable[i].chooseable = 0;
                        }
                    }

                }
                spendable.sort(Compare('chooseable'));
                let arr = [];
                for(let i = spendable.length-1; i >= 0; i --){
                    if(spendable[i].ischecked == true){
                        arr.push(spendable[i]);
                        spendable.splice(i,1)
                    }
                }
                for (let i = 0; i < arr.length; i ++){
                    spendable.unshift(arr[i])
                }


                for(let a = 0; a < spendable.length; a ++){
                    this.list.push(spendable[a])
                };
                 for(let b = 0; b < this.unusable_list.length; b ++){
                    this.list.push(this.unusable_list[b])
                };
                this.id.push(item.coupons_id);
            }else{
                // 不选择
                item.ischecked = false;
                if(item.is_threshold == 2){
                    for(let i = 0; i < spendable.length; i ++){
                        if(spendable[i].is_threshold == 2){
                            spendable[i].chooseable = 1;
                        }
                        if(spendable[i].coupons_id == item.coupons_id){
                            spendable[i].ischecked = false;
                        }
                    }
                }else{
                    for(let i = 0; i < spendable.length; i ++){
                        if(spendable[i].coupons_id == item.coupons_id){
                            spendable[i].ischecked = false;
                        }
                    }
                }
                spendable.sort(Compare('chooseable'));
                let arr = [];
                for(let i = spendable.length-1; i >= 0; i --){
                    if(spendable[i].ischecked == true){
                        arr.push(spendable[i]);
                        spendable.splice(i,1)
                    }
                }
                for (let i = 0; i < arr.length; i ++){
                    spendable.unshift(arr[i])
                }

                for(let i = 0; i < spendable.length; i ++){
                    this.list.push(spendable[i]);
                }
                
                for(let b = 0; b < this.unusable_list.length; b ++){
                    this.list.push(this.unusable_list[b])
                };

                for(let a = 0; a < this.id.length; a ++){
                    if(this.id[a] == item.coupons_id){
                        this.id.splice(a,1);
                    }
                }

                
            }
            document.querySelectorAll('.coupons-box')[0].scrollTop = 0;
        },

        //  点击确定，向父组件传值
        Confirm(){
            this.$emit('ListenToCoupon',this.id,this.sums)
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
        padding-bottom: .8rem
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
    .coupons-box{
        max-height: 2.8rem;
        overflow: auto;
        margin-bottom: .8rem;
    }
    .all_coupons{
        overflow: auto;
        height: auto;
       
    }
    .best-coupons,.coupons,.unable-coupons{
        overflow: hidden;
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
         width: 1.24rem;
        height: .98rem;
        position: absolute;
        top: 0;
        left: 0;
    }
    .coupon-left i{
        font-size: .17rem;
    }
    .coupon-left .sum{
        position: absolute;
        top: .21rem;
        width: 1.24rem;
        font-size: .31rem;
        text-align: center;
    }
    .coupon-left .amanjian{
        position: absolute;
        top: .64rem;
        width: 1.24rem;
        text-align: center;
        font-size: .12rem;
        letter-spacing:1px;
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
