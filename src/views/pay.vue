<template>
	<div class="payment">
		<!-- <header>{{this.info.store_name}}</header> -->
		<div class="area-AD">
		  <img src="../assets/ad.png" alt="">
		</div>
		<div class="input">
			<div class="input-price">
				￥
				<p>
					<!-- <input type="text" placeholder="请输入付款金额" v-model="sum"> -->
					<span class="no-sum" v-if="havesum">请输入付款金额</span>
					<span class="have-sum" v-text="sum"></span>
					<span @click="cleansum" v-if="!havesum"><img src="../assets/quxiao.png" alt=""></span>
				</p>
			</div>
			<div class="discount" @click="handlecoupons" v-if="havecoupon">
				<p style="float:left">优惠券</p>
				<p class="discount-tuijian" v-show='show_recommend'>已选推荐优惠</p>
				<p class="jianshao"><i style="font-size:14px"></i>{{coupon}} <img src="../assets/arro-right.png" /></p>
			</div>
			<div class="manjian" v-show='isshow'>
				<span>满减优惠：</span>
				<span class="manjian-fudu">满 {{this.key}} 减 {{this.manjian}}</span>
			</div>
			<div class="amount">
				<span>合计：</span>
				<span class="total"><span style="font-size:.1rem">￥</span>{{this.amount}}</span>
			</div>
		</div>
		<div class="zhanwei"></div>
		<div class="area-keyboard">
			<x-keyboard v-on:change-sum="showSum"
			:sum='sum'
			:amount='amount'
			:coupon_id='coupon_id'
			:is_reduction_removed='info.is_reduction_removed'/>
		</div>

		<!-- 选择优惠券 -->
		<div class="area-mask" v-if="isclose">
			 <div class="mask" @click="handlecoupons"></div>
			<checkout-discount 
			:couponlist='couponlist' 
			:sum='sum' 
			:spendable_coupons='spendable_coupons' 
			:recommend_coupon='[recommend_coupon]'
			v-on:ListenToCoupon="getCouponsid"
			/>
			
		</div>
		
	</div>
</template>

<script>

	import XKeyboard from "../components/x-keyboard.vue";
	import CheckoutDiscount from '../components/checkout-discount.vue'
	import { getBrowserType, getUrlParams, getUserid, getUnionid, getToken} from '../utils/get_info.js'
	import { Cookie, Compare, NewArrObj } from '../utils/common.js'
	import { Login } from '../utils/handle_login.js'
	import { storeInfo } from '../api/api'
	import axios from 'axios'

const baseUrl = process.env.VUE_APP_BASE_DOMAIN;
import { constants } from 'fs';
	
	


	export default{
		
		data(){
			return{
				isclose:false,
				sum:'',
				havesum:true,
				info:'',
				manjian:0,
				key:null,
				isshow:false,
				coupon:'',
				havecoupon:false,
				couponlist:[],
				recommend_coupon:{},
				show_recommend:false,
				spendable_coupons:[],
				unable_coupons:[],
				amount:0,
				couponsSum:0,
				coupon_id:[],
				reduction_money_list:[]
			}
			
		},

		components:{
			XKeyboard,
			CheckoutDiscount
		},

		watch:{
			sum:function(newVal,oldVal){
				if(newVal > 100000){
					this.sum = oldVal;
				}
				
				this.moneyOff();
				this.RecommendCoupon(newVal);
				if(newVal == ''){
					this.recommend_coupon = {};
					let num = this.couponlist.length;
					this.coupon = num + '张可用';
					this.amount = 0;
					if(this.recommend_coupon[0] == undefined){
						this.show_recommend = false;
					}
				};
				this.amount = newVal - this.manjian - this.couponsSum;
				this.amount = this.amount.toFixed(2);
			},
			manjian:function(a,b){
				console.log('manjian:'+a)
				this.amount = this.sum*1 - a - this.couponsSum*1 
				if(this.amount < 0){
					this.amount = 0
				}
				this.amount = this.amount.toFixed(2)
				
			},
			couponsSum:function(a,b){
				console.log('couponSum:'+a)
					if(a == 0){
						let num = this.couponlist.length;
						this.coupon = num + '张可用';
					}
					console.log('couponSum:'+a)
					this.amount = this.sum*1 - a - this.manjian;
					this.amount = this.amount.toFixed(2);
					if(this.amount < 0){
						this.amount = 0
					}
			},
			info:function(a,b){
				this.couponNum()
				this.couponlist = this.info.coupons_required_products_list;
			},


		},

	
		created(){
			
			this.getStoreinfo();
		},

		mounted(){
			this.reduction_money_list = this.info.reduction_money_list
		},
	


		methods:{
				// 显示隐藏优惠券列表
				handlecoupons(){
					this.isclose = !this.isclose;
					
				},
				// 显示金额
				showSum(sum,showSum){
					this.sum=sum;
					this.havesum = showSum;
					if(!this.sum){
						this.havesum = true;
					}
				},
				// 清空金额
				cleansum(){
					this.sum = '';
					this.havesum = true;
					this.amount = 0;
				},
				// 获取商店信息
				async getStoreinfo(){
					let code_id = getUrlParams().code_id
					let params = {
						code_id
					};
				
					let {data} = await storeInfo(params).catch(err => {
						console.log(err)
						throw Error("--- 获取店铺基本信息出错 ---")
					})
					this.info = data;
					// let info = {"code":200,"message":"\u83b7\u53d6\u6570\u636e\u6210\u529f\uff01","data":{"store_name":"\u5143\u6c14\u5bff\u53f8","payment_status":"3","ad_location":"www.baidu.com","is_reduction_removed":1,"reduction_money_list":{"100":"25","200":"50","300":"80"},"coupons_required_products_list":[{"coupons_id":1356,"coupons_name":"\u4ece10\u5143\u589e\u503c\u523080\u5143","money":"38.07","expiration":"2019-08-25 00:00:00","is_threshold":2,"full_money":10,"ischecked":false},{"coupons_id":1358,"coupons_name":"\u4ece10\u5143\u589e\u503c\u523080\u5143","money":"84.44","expiration":"2019-08-25 00:00:00","is_threshold":2,"full_money":10,"ischecked":false},{"coupons_id":1357,"coupons_name":"\u4ece10\u5143\u589e\u503c\u523080\u5143","money":"52.42","expiration":"2019-08-25 00:00:00","is_threshold":2,"full_money":10,"ischecked":false}]},"field_help":{"1":"store_name=\u5e97\u94fa\u540d\u79f0","2":"payment_status=\u5e97\u94fa\u72b6\u6001 0\u672a\u5f00\u901a 1\u5f85\u5ba1\u6838 2\u5df2\u62d2\u7edd 3\u6b63\u5e38","3":"ad_location=\u5e7f\u544a\u4f4d\u7f6e","4":"is_reduction_removed=\u662f\u5426\u6709\u6ee1\u51cf 1\u6709\uff08\u5982\u679c\u6709 reduction_money_list\u4e0d\u4e3a\u7a7a\uff09 0\u6ca1\u6709 ","5":"reduction_money_list=\u6ee1\u51cf\u91d1\u989d\u5217\u8868,\u4f8b\u5982\uff1a\u6ee1\u4e00\u767e\u51cf20 \u6ee1200\u51cf40","6":"coupons_required_products_list=\u4f18\u60e0\u5238\u5217\u8868\u3010coupons_id=\u4f18\u60e0\u5238ID\uff0ccoupons_name=\u4f18\u60e0\u5238\u540d\u79f0\uff0cmoney=\u4f18\u60e0\u5238\u91d1\u989d\uff0cexpiration=\u8fc7\u671f\u65f6\u95f4\uff0cis_threshold=\u662f\u5426\u6709\u95e8\u69db\uff081\u65e0\u95e8\u69db 2\u6709\u95e8\u69db\uff09full_money=\u6ee10\u5c31\u662f\u65e0\u95e8\u69db\u7684\u3011"}}
					// this.info = info.data;
					// console.log(this.info)
					document.title = data.store_name || '团卖物联支付';
				},

				// 判断是否有满减
				moneyOff(){
					this.key = null
					this.manjian = 0
					this.isshow = false
					if(this.info.is_reduction_removed == 1){

						let manjian = this.info.reduction_money_list

						for(let key in manjian){
						
							if(this.sum >= key*1){
							 
								this.manjian = manjian[key];
								this.key = key;
								this.isshow = true;
							}
						}
					}
				},

				// 判断是否有优惠券及数量
				couponNum(){
					let info = JSON.parse(JSON.stringify(this.info));

					var num = this.info.coupons_required_products_list.length;
					// console.log('num:'+num.length)
					if(num){
				
						this.havecoupon = true;
						this.coupon = num + '张可用'
					}
				},

				// 选择最佳优惠
				RecommendCoupon(newVal){
					let list = this.info.coupons_required_products_list;
					for (let a = 0; a < list.length; a ++){
						list[a].chooseable = 2;
					}
					let best_coupon = {};
					let spendable_coupons = [];
					let sort_spendable_coupons = [];
					if(list.length){
							if(this.info.is_reduction_removed == 1){
							
							// 有满减的情况
							let manjian = this.info.reduction_money_list;
							let limits = [];
							let limit = 0;
							for(let key in manjian){
								limits.push(key);

							}
							limit = limits[0];

							// 满减达到要求	
							if(newVal*1 >= limit){
								spendable_coupons = [];
								sort_spendable_coupons = [];
								for(let i = 0;i < list.length; i++){
									if(list[i].is_threshold == 1){
										spendable_coupons.push(list[i]);
										sort_spendable_coupons = spendable_coupons.sort(Compare('money'));
										best_coupon = sort_spendable_coupons[0];
										
										this.recommend_coupon = best_coupon;
										this.coupon = '-￥'+best_coupon.money;
										this.show_recommend = true;
									}

								}
								this.spendable_coupons = spendable_coupons;
							}else{
							// 未达到满减要求	
								spendable_coupons = [];	
								sort_spendable_coupons = [];
								for(let i = 0; i < list.length; i++){
									if(newVal >= list[i].full_money){
										spendable_coupons.push(list[i]);
									
										sort_spendable_coupons = spendable_coupons.sort(Compare('money'));
										let arr = [];
										for( let a = 0; a < sort_spendable_coupons.length; a++){
											let money = sort_spendable_coupons[0].money
											if(money == sort_spendable_coupons[a].money){
												arr.push(sort_spendable_coupons[a])
											}
										}
										var arr1 = [];
										for( let b = 0; b < arr.length;b++){
											if(arr[b].is_threshold == 2){
												arr1.push(arr[b]);
												best_coupon = arr1.sort(Compare('full_money'))[0];
												this.recommend_coupon = best_coupon;
												this.coupon = '-￥'+best_coupon.money;
												this.show_recommend = true;
											}else{
												best_coupon = sort_spendable_coupons[0];
												this.recommend_coupon = best_coupon;
												this.coupon = '-￥'+best_coupon.money;
												this.show_recommend = true;
											}
										}
									this.coupon_id = [this.recommend_coupon.coupons_id];
									this.couponsSum = this.recommend_coupon.money*1;
									this.spendable_coupons = spendable_coupons;


									}else{
										this.couponsSum = 0;
										this.spendable_coupons = [];
									}
								}
									
							}
							
							
						}else{
							// 没有满减的情况
								spendable_coupons = [];	
								sort_spendable_coupons = [];
								for(let i = 0; i < list.length; i++){
									if(newVal >= list[i].full_money){
										spendable_coupons.push(list[i]);
										console.log('未达到满减要求：');
										this.show_recommend = spendable_coupons;
										sort_spendable_coupons = spendable_coupons.sort(Compare('money'));
										let arr = [];
										for( let a = 0; a < sort_spendable_coupons.length; a++){
											let money = sort_spendable_coupons[0].money
											if(money == sort_spendable_coupons[a].money){
												arr.push(sort_spendable_coupons[a])
											}
										}
										var arr1 = [];
										for( let b = 0; b < arr.length;b++){
											if(arr[b].is_threshold == 2){
												arr1.push(arr[b]);
												best_coupon = arr1.sort(Compare('full_money'))[0];
												this.recommend_coupon = best_coupon;
												this.coupon = '-￥'+best_coupon.money;
												this.show_recommend = true;
											}else{
												best_coupon = sort_spendable_coupons[0];
												this.recommend_coupon = best_coupon;
												this.coupon = '-￥'+best_coupon.money;
												this.show_recommend = true;
											}
										}
									
									}
								}
								this.spendable_coupons = spendable_coupons;
						}
					}
					
				},

				// 监听从优惠券组件传回的值
				getCouponsid(id){
					if(id.length){
						this.coupon_id = id
						this.isclose = false;
						let coupons = this.couponlist;
						this.couponsSum = '';
						let sum = 0;
						let arr = [];
						for(var i = 0; i < coupons.length; i ++){
							for(var j = 0; j < id.length; j ++){
								if(coupons[i].coupons_id == id[j]){
									arr.push(coupons[i])
								}
							}
							
						}
						for(var a = 0; a < arr.length; a ++){
							sum += arr[a].money
						}
						this.couponsSum = sum;

					}
				}

			




		}





	}
</script>

<style scoped>
.payment{
	background: #f2f2f2;
	height: 100%;
	overflow: auto;
}
.area-keyboard{
	position: fixed;
	bottom: 0;
	z-index: 10;
}
.area-mask{
	position: absolute;
	top: 0;
	z-index: 111;
}
	header{
		height: 47px;
		font-size: 17px;
		text-align: center;
		line-height: 47px;
		background: #fff;
	}
	.area-AD{
		height: 1.54rem;
		width: 100%;
	}
	.area-AD img{
		width: 100%;
		pointer-events: none
	}
	.area-keyboard{
		background: #f2f2f2;
	}
	.input{
		/* height: 1.125rem; */
		background: #fff;
		margin-top: .14rem;
	}
	.zhanwei{
		height: 2.52rem;
		width: 100%;
	}
	.input-price{
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: .66rem;
		font-size: .2rem;
		line-height: .66rem;
		padding : .22rem 0;
		margin: 0 .11rem;
		border-bottom: 1px solid #ebebeb;
	}
	.input-price p{
		width: 3.28rem;
		font-size: .24rem;
		color: #c6c6c6;
		font-weight: 100;
		position: relative;
	}
	.input-price .no-sum{
		font-size: .23rem;
		position: absolute;
		left: 0;
		top: -.32rem;
		/* top: .33rem; */
	}
	.input-price .have-sum{
		font-size: .37rem;
		color: #313131;
		position: absolute;
		left: 0;
		font-weight: 500;
	}
	.input-price span{
		float: right;
	}
	.input-price span img{
		width: .18rem;
	}
	.discount,.manjian{
		height: .45rem;
		line-height: .45rem;
		color:#313131;
		font-size:.13rem;
		margin: 0 .11rem;
		border-bottom: 1px solid #ebebeb;
	}
	.jianshao img{
		width: 5px;
		margin-top: -2px;
	}
	.discount-tuijian{
		float: left;
		font-size: .12rem;
		line-height: .17rem;
		width: .76rem;
		padding-left: .04rem;
		height: .17rem;
		border: 1px solid #de1e13;
		border-radius: 2px;
		margin-top: .15rem;
		margin-left: .09rem;
		color: #de1e13;
	}
	.discount .jianshao,.manjian-fudu{
		float: right;
		height: .45rem;
		line-height: .45rem;
		font-size: .12rem;
	}
	.amount{
		font-size: .13rem;
		line-height: .45rem;
		margin: 0 .11rem;
		color: #313131;
	}
	.amount .total{
		color: #de1e13;
		float: right;
		font-size: .17rem;
		font-weight: 600;
	}
	.mask{
        background: #000;
        opacity: .7;
        width: 100vw;
		height: 100vh;
		position: absolute;
    }



	
</style>
