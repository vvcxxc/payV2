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
				<p class="discount-tuijian" v-show='show_recommend'>{{youhui}}</p>
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
			:is_reduction_removed='info.is_reduction_removed'
			:storename='info.store_name'/>
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
				reduction_money_list:[],
				youhui:'已选推荐优惠'
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
					this.show_recommend = false;
					this.couponsSum = 0;
					if(this.recommend_coupon[0] == undefined){
						this.show_recommend = false;
					}
				};
				this.amount = newVal - this.manjian - this.couponsSum;
				this.amount = this.amount.toFixed(2);
			},
			manjian:function(a,b){
				this.amount = this.sum*1 - a - this.couponsSum*1 
				if(this.amount < 0){
					this.amount = 0
				}
				this.amount = this.amount.toFixed(2)
				
			},
			couponsSum:function(a,b){
					a = a*1;
					a.toFixed(2)
					if(a == 0){
						let num = this.couponlist.length;
						this.coupon = num + '张可用';
					}else{
						this.coupon ='-￥'+ a;
					}
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
			amount:function(a,b){
				if(a < 0){
					this.amount = 0;
				}
			}
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
					document.title = data.store_name || '团卖物联支付';
					// let info = {"code":200,"message":"获取数据成功！","data":{"store_name":"元气寿司","payment_status":"3","ad_location":"www.baidu.com","is_reduction_removed":1,"reduction_money_list":{"100":"25","200":"50","300":"80"},"coupons_required_products_list":[{"coupons_id":1356,"coupons_name":"从10元增值到80元","money":"38.07","expiration":"2019-08-25 00:00:00","is_threshold":2,"full_money":10,"ischecked":false},{"coupons_id":1358,"coupons_name":"从10元增值到80元","money":"84.44","expiration":"2019-08-25 00:00:00","is_threshold":2,"full_money":10,"ischecked":false},{"coupons_id":1357,"coupons_name":"从10元增值到80元","money":"52.42","expiration":"2019-08-25 00:00:00","is_threshold":2,"full_money":10,"ischecked":false},{"coupons_id":1359,"coupons_name":"","money":"30","expiration":"2019-08-25 00:00:00","is_threshold":1,"full_money":0,"ischecked":false},{"coupons_id":1360,"coupons_name":"","money":"20","expiration":"2019-08-25 00:00:00","is_threshold":1,"full_money":0,"ischecked":false}]},"field_help":{"1":"store_name=店铺名称","2":"payment_status=店铺状态 0未开通 1待审核 2已拒绝 3正常","3":"ad_location=广告位置","4":"is_reduction_removed=是否有满减 1有（如果有 reduction_money_list不为空） 0没有 ","5":"reduction_money_list=满减金额列表,例如：满一百减20 满200减40","6":"coupons_required_products_list=优惠券列表【coupons_id=优惠券ID，coupons_name=优惠券名称，money=优惠券金额，expiration=过期时间，is_threshold=是否有门槛（1无门槛 2有门槛）full_money=满0就是无门槛的】"}}
					// this.info = info.data;
				},

				// 判断是否有满减
				moneyOff(){
					this.key = 0;
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
					let couponSum = 0;
					this.couponsSum = 0;
					let best_coupon = [];
					let spendable_coupons = [];
					let sort_spendable_coupons = [];
					this.id = [];


					if(list.length){
						// 为每个优惠券添加一个属性，来判断它是否可用
						for (let a = 0; a < list.length; a ++){
							list[a].chooseable = 0;
						}
						if(this.info.is_reduction_removed == 1){
						// 有满减的情况
						let manjian = this.info.reduction_money_list;
						let limits = [];
						let limit = 0;

						for(let key in manjian){
							limits.push(key);

						}
						limit = limits[0];

							if(newVal*1 >= limit){
								// 达到满减要求
								for(let i = 0; i < list.length; i ++){
									if(list[i].is_threshold == 1){
										spendable_coupons.push(list[i])
									}
								}
								if(spendable_coupons.length){
									spendable_coupons.sort(Compare('money'));
									best_coupon.push(spendable_coupons[0]);
									couponSum = best_coupon[0].money;
									this.id.push(best_coupon[0].coupons_id)
								}
								this.couponsSum = couponSum;
								this.recommend_coupon = best_coupon;
								this.spendable_coupons = spendable_coupons;
								this.show_recommend = true;
								this.youhui = '已选推荐优惠'
							}else{
								// 未达到满减要求
								for(let i = 0; i < list.length; i ++){
									if(list[i].is_threshold == 1){
										spendable_coupons.push(list[i])
									}else{
										if(list[i].full_money <= newVal*1){
											spendable_coupons.push(list[i])
										}
									}
								}
								// 存在可用券
								let arr = []; //把可用的优惠额度最高的放在这里
								if(spendable_coupons.length){
									spendable_coupons.sort(Compare('money'));
									let money = spendable_coupons[0].money;
									for(let a = 0; a < spendable_coupons.length; a ++){
										if(money == spendable_coupons[a].money){
											arr.push(spendable_coupons[a]);
										}
									}
									if(arr.length <= 1){
										best_coupon = arr[0];
										couponSum = best_coupon.money;
									}else{
										for(let a = 0; a < arr.length; a ++){
											if(arr[a].is_threshold == 2){
												best_coupon = arr[a];
												couponSum = best_coupon.money;
											}else{
												best_coupon = arr[a];
												couponSum = best_coupon.money;
											}
										}
									}
									this.id.push(best_coupon.coupons_id);
								}
								this.recommend_coupon = best_coupon;
								this.spendable_coupons = spendable_coupons;
								this.couponsSum = couponSum;
								this.show_recommend = true;
								this.youhui = '已选推荐优惠'
							}
						
						}else{
							// 没有满减的情况
							for(let i = 0; i < list.length; i ++){
								if(list[i].is_threshold == 1){
									spendable_coupons.push(list[i])
								}else{
									if(list[i].full_money <= newVal*1){
										spendable_coupons.push(list[i])
									}
								}
							}

							// 存在可用券
							let arr = []; //把可用的优惠额度最高的放在这里
								if(spendable_coupons.length){
									spendable_coupons.sort(Compare('money'));
									let money = spendable_coupons[0].money;
									for(let a = 0; a < spendable_coupons.length; a ++){
										if(money == spendable_coupons[a].money){
											arr.push(spendable_coupons[a]);
										}
									}
									if(arr.length <= 1){
										best_coupon = arr[0];
										couponSum = best_coupon.money;
									}else{
										for(let a = 0; a < arr.length; a ++){
											if(arr[a].is_threshold == 2){
												best_coupon = arr[a];
												couponSum = best_coupon.money;
											}else{
												best_coupon = arr[a];
												couponSum = best_coupon.money;
											}
										}
									}
									this.id.push(best_coupon.coupons_id);
								}
								this.recommend_coupon = best_coupon;
								this.spendable_coupons = spendable_coupons;
								this.couponsSum = couponSum;
								this.show_recommend = true;
								this.youhui = '已选推荐优惠'
						}
					}
					
				},

				// 监听从优惠券组件传回的值
				getCouponsid(id,sums){
					console.log(id,sums)
					if(id.length){
						this.couponsSum = sums;
						this.coupon_id = id;
						this.youhui = '已选'+id.length+'张优惠券'
					}else{
						this.couponsSum = 0;
					}
					this.isclose = false;
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
		width: auto;
		padding: 0 .04rem;
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
