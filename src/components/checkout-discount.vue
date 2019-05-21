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
                <div class="best-coupons">
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
                </div>

                <!-- 可以用的券 -->
                <div class="coupons">
                    <div class="coupon" v-for="(item,idx) in spendable_list" v-bind:key=idx @click="chooseOne(item,idx)">
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
import '../styles/common.css';
export default {
   data () {
       return{
           list:[],
           sums:'',
           spendable_list:[],
           unusable_list:[],
           best_coupon:[],
           id:[]
       }
   },
   
  
   props:['couponlist','sum','spendable_coupons','recommend_coupon'],
   created(){
       this.unusable_list = NewArrObj(this.couponlist,this.spendable_coupons);
       this.spendable_list = NewArrObj(this.spendable_coupons,this.recommend_coupon)
       this.best_coupon = this.recommend_coupon;
       this.list = this.couponlist;
       if(this.sum == ''){
           this.unusable_list = this.list;
           this.best_coupon = [];
           this.spendable_list = [];
       }
       //默认选择最佳优惠
       this.chooseBest();
    
   },
   
   updated(){
       for(var i = 0; i < this.spendable_list.length; i ++){
           this.$refs.chooseone[i].style.backgroundPositionX = 18 + 'px';
           if (this.spendable_list[i].ischecked == true) {
               this.$refs.chooseone[i].style.backgroundPositionX = 0;
           }
       }
   },

   methods:{
       //初始化的时候默认选择最佳优惠
       chooseBest(){
           if(this.best_coupon.length){
                this.best_coupon[0].ischecked = true;
                this.id.push(this.best_coupon[0].coupons_id);
                let best = this.best_coupon[0];
                let spendable = [...this.spendable_list];
                let unable = [...this.unusable_list]
                // 判断最佳优惠是否为门槛券
                if(best.is_threshold == 2){
                    if(spendable.length){
                        for(var i = spendable.length-1; i >= 0; i --){
                            if(spendable[i].is_threshold == 2){
                                unable.unshift(spendable[i]);
                                spendable.splice(i,1);
                            }
                        }
                        this.spendable_list = spendable;
                        this.unusable_list = unable;
                        
                    }
                }
                this.sums = this.best_coupon[0].money
           }
       },

        // 是否选择推荐优惠
        isBest(item){
            let best = this.best_coupon[0];
            let spendable = [...this.spendable_list];
            let unable = [...this.unusable_list]
            if(item.ischecked == false){
                this.id.push(item.coupons_id);
                if(best.is_threshold == 2){
                    if(spendable.length){
                        for(var i = spendable.length-1; i >= 0; i --){
                            if(spendable[i].is_threshold == 2){
                                unable.unshift(spendable[i]);
                                spendable.splice(i,1);
                            }
                        }
                        this.spendable_list = spendable;
                        this.unusable_list = unable;
                        
                    }
                }
                this.$refs.choosebest[0].style.backgroundPositionX = 0;
                item.ischecked = !item.ischecked;
            }else if(item.ischecked == true){
                let idx = this.id.indexOf(item.coupons_id);
                if(idx >= 0){
                    this.id.splice(idx,1);
                }              
                this.$refs.choosebest[0].style.backgroundPositionX = 18 + 'px';
                this.spendable_list = NewArrObj(this.spendable_coupons,this.recommend_coupon);
                this.best_coupon = this.recommend_coupon;
                this.unusable_list = NewArrObj(this.couponlist,this.spendable_coupons);
                item.ischecked = !item.ischecked;
            }
        },

        // 点击选择优惠券
        chooseOne(item,idx){
            let best = this.best_coupon[0];
            let spendable = [...this.spendable_list];
            let unable = [...this.unusable_list]
            if(item.ischecked == false){
                if(item.is_threshold == 2){
                    for(var i = spendable.length-1; i >= 0; i --){
                        if(item.coupons_id == spendable[i].coupons_id){
                            if(best.is_threshold == 2){
                                unable.unshift(best)
                                this.best_coupon.splice(0,1);
                             
                            }else{
                               
                                spendable.unshift(best);
                                this.best_coupon.splice(0,1);
                            }
                                this.best_coupon.unshift(item);
                                spendable.splice(i,1)
                                this.$refs.choosebest[0].style.backgroundPositionX = 0;
                                this.id.push(item.coupons_id)
                        }else{
                            if(spendable[i].is_threshold == 2){
                                spendable[i].ischecked = false;
                                unable.unshift(spendable[i]);
                                spendable.splice(i,1);
                            }
                            
                        }
                    }
                }else if(item.is_threshold == 1){
                    for(let i = 0; i < spendable.length; i ++){
                        if(item.coupons_id == spendable[i].coupons_id){
                            this.$refs.chooseone[i].style.backgroundPositionX = 0;
                        }
                    }
                    
                    this.id.push(item.coupons_id);
                }
                this.spendable_list = spendable;
                this.unusable_list = unable;
                item.ischecked = !item.ischecked;
            }else{
                if(item.is_threshold == 2){
                    this.best_coupon = this.recommend_coupon;
                    this.spendable_list = NewArrObj(this.spendable_coupons,this.recommend_coupon);
                    this.unusable_list = NewArrObj(this.couponlist,this.spendable_coupons);
                    if(this.id.length){
                        for(let i = 0; i < this.spendable_list.length; i ++){
                            for(let j = 0; j < this.id.length; j ++){
                                if(this.spendable_list[i].coupons_id == this.id[j]){
                                    this.$refs.chooseone[i].style.backgroundPositionX = 0;
                                    this.spendable_list[i].ischecked = true;
                                }
                            }
                        }
                        for(let a = 0; a < this.id.length; a ++){
                            if(this.id[a] == this.best_coupon[0].coupons_id){
                                this.$refs.choosebest[0].style.backgroundPositionX = 0;
                                this.best_coupon[0].ischecked = true;       
                            }
                        }
                    }
                    let idxs = this.id.indexOf(item.coupons_id);
                    this.id.splice(idxs,1);
                }else{
                    let idxs = this.id.indexOf(item.coupons_id);
                    this.id.splice(idxs,1)
                    this.$refs.chooseone[idx].style.backgroundPositionX = 18 + 'px'
                }
               
                item.ischecked = !item.ischecked;
            }
            
            document.querySelectorAll('.coupons-box')[0].scrollTop = 0;
        },

        //  点击确定，向父组件传值
        Confirm(){
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
