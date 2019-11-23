<template>
  <div class="checkout">
    <div class="discounts">
      <header>现金券</header>
      <div class="youhuijine">
        您已选中优惠券{{num}}张，共可抵用
        <span>¥{{sums}}</span>
      </div>
      <div class="coupons-box">
        <div class="all_coupons" ref="top">
          <!-- 可以用的券 -->
          <div class="coupons">
            <div
              v-bind:class="item.chooseable ? 'coupon' : 'u-coupon'"
              v-for="(item,idx) in list"
              v-bind:key="idx"
              ref="couponbg"
              @click="item.chooseable && SortCoupons(item)"
            >
              <div class="couponleft">
                <div class="coupon-left">
                  <p class="sum">
                    <i>￥</i>
                    {{item.money}}
                  </p>
                  <p class="amanjian">{{item.coupons_name}}</p>
                </div>
              </div>

              <div class="coupon-right">
                <p class="coupon-shop">{{item.store_name}}</p>
                <p class="coupon-time">{{item.expiration}}</p>
                <span class="coupon-choose" v-if="item.ischecked"></span>
                <span class="coupon-no-choose" v-else></span>
              </div>
            </div>
          </div>
          <!-- 站位 -->
          <div style="height: .3rem"></div>
        </div>
      </div>
    </div>
    <div class="confirm-box">
      <a class="confirm" @click="Confirm">{{text}}</a>
    </div>
  </div>
</template>
<script>
import { NewArrObj, Compare, RemoveDup } from "../utils/common.js";
import "../styles/common.css";
export default {
  data() {
    return {
      list: [],
      sums: 0,
      spendable_list: [],
      unusable_list: [],
      best_coupon: [],
      id: [],
      num: 0,
      text: "确定"
    };
  },
  props: ["couponlist", "sum", "spendable_coupons", "coupon_id"],
  watch: {
    list: function(newVal) {},
    id: function(a) {
      this.num = a.length;
      let sums = 0;
      for (let i in this.couponlist) {
        for (let z in a) {
          if (this.couponlist[i].coupons_id == a[z]) {
            console.log(this.couponlist[i].money);
            sums = (sums * 100 + this.couponlist[i].money * 100) / 100;
          }
        }
      }
      this.sums = sums;
    },
    coupon_id: function() {
      // this.Coupons();
    }
  },

  created() {
    console.log(this.couponlist)
    this.Coupons();
  },

  methods: {
    // 初始化渲染
    Coupons() {
      let spendable = this.spendable_coupons; // 可用券
      if (spendable.length) {
        this.text = "确定";
      } else {
        this.text = "取消";
      }
      let unusable_list = NewArrObj(this.couponlist, spendable); // 不可用券
      this.id = this.coupon_id;
      let list = []; // 所有的券
      let is_ok = false; //判断是否选择了有门槛
      if (unusable_list.length) {
        for (let i in unusable_list) {
          unusable_list[i].chooseable = 0;
          unusable_list[i].ischecked = false;
        }
      }
      if (spendable.length && this.sum) {
        for (let i in spendable) {
          spendable[i].chooseable = 1;
          spendable[i].ischecked = false;
          for (let a in this.coupon_id) {
            if (spendable[i].coupons_id == this.coupon_id[a]) {
              spendable[i].ischecked = true;
              if (spendable[i].is_threshold == 2) is_ok = true;
            }
            if (is_ok) {
              if (
                spendable[i].ischecked == false &&
                spendable[i].is_threshold == 2
              ) {
                spendable[i].chooseable = 0;
                spendable[i].ischecked = false;
              }
            }
          }
        }
        // spendable.sort(Compare("chooseable"));
        // spendable.sort(Compare("ischecked"));
        for (let a in spendable) {
          list.push(spendable[a]);
        }
      }
      if (unusable_list) {
        for (let i in unusable_list) {
          unusable_list[i].chooseable = 0;
          list.push(unusable_list[i]);
        }
      }
      this.unusable_list = unusable_list;
      if (!this.sum) {
        let arr = [...this.couponlist];
        for (let i in arr) {
          arr[i].chooseable = 0;
          arr[i].ischecked = false;
        }
        list = arr;
      }

      this.list = this.SortList(list);
    },

    // 优惠券排序
    SortList(list) {
      let arr1 = []; // 可以使用的
      let arr2 = []; // 不可以使用的
      for (let i in list) {
        if (list[i].chooseable) {
          arr1.push(list[i]);
        } else {
          arr2.push(list[i]);
        }
      }
      arr1.sort(Compare("money"));
      arr1.sort(Compare("ischecked"));
      arr2.sort(Compare("money"));
      let arr = [...arr1, ...arr2];
      return arr;
    },

    // 选择优惠券(有待提高版)
    SortCoupons(item) {
      this.list = []; //渲染此项
      let spendable = [...this.spendable_coupons];
      if (item.ischecked == false) {
        // 选择
        item.ischecked = true;
        if (item.is_threshold == 1) {
          this.list.unshift(item);
          for (let i = 0; i < spendable.length; i++) {
            if (spendable[i].coupons_id == item.coupons_id) {
              spendable.splice(i, 1);
            }
          }
        } else {
          this.list.unshift(item);
          for (let i = spendable.length - 1; i >= 0; i--) {
            if (spendable[i].coupons_id == item.coupons_id) {
              spendable.splice(i, 1);
            }
          }
          for (let i = spendable.length - 1; i >= 0; i--) {
            if (spendable[i].is_threshold == 2) {
              spendable[i].ischecked = false;
              spendable[i].chooseable = 0;
            }
          }
        }
        spendable.sort(Compare("chooseable"));
        let arr = [];
        for (let i = spendable.length - 1; i >= 0; i--) {
          if (spendable[i].ischecked == true) {
            arr.push(spendable[i]);
            spendable.splice(i, 1);
          }
        }
        for (let i = 0; i < arr.length; i++) {
          spendable.unshift(arr[i]);
        }

        for (let a = 0; a < spendable.length; a++) {
          this.list.push(spendable[a]);
        }
        for (let b = 0; b < this.unusable_list.length; b++) {
          // console.log(this.unusable_list)
          this.list.push(this.unusable_list[b]);
        }
        this.id.push(item.coupons_id);
        this.list = RemoveDup(this.list);
      } else {
        // 不选择
        item.ischecked = false;
        // console.log(this.id)
        if (item.is_threshold == 2) {
          for (let i = 0; i < spendable.length; i++) {
            if (spendable[i].is_threshold == 2) {
              spendable[i].chooseable = 1;
            }
            if (spendable[i].coupons_id == item.coupons_id) {
              spendable[i].ischecked = false;
            }
          }
        } else {
          for (let i = 0; i < spendable.length; i++) {
            if (spendable[i].coupons_id == item.coupons_id) {
              spendable[i].ischecked = false;
            }
          }
        }
        spendable.sort(Compare("chooseable"));
        let arr = [];
        for (let i = spendable.length - 1; i >= 0; i--) {
          if (spendable[i].ischecked == true) {
            arr.push(spendable[i]);
            spendable.splice(i, 1);
          }
        }
        for (let i = 0; i < arr.length; i++) {
          spendable.unshift(arr[i]);
        }

        for (let i = 0; i < spendable.length; i++) {
          this.list.push(spendable[i]);
        }

        for (let b = 0; b < this.unusable_list.length; b++) {
          this.list.push(this.unusable_list[b]);
        }
        for (let a = this.id.length; a >= 0; a--) {
          if (this.id[a] == item.coupons_id) {
            this.id.splice(a, 1);
          }
        }

        this.list = RemoveDup(this.list);
      }
      document.querySelectorAll(".coupons-box")[0].scrollTop = 0;
    },

    //  点击确定，向父组件传值
    Confirm() {
      this.id = RemoveDup(this.id);
      this.$emit("ListenToCoupon", this.id, this.sums);
    }
  }
};
</script>
<style scoped>
.checkout {
  /* position: fixed;
  bottom: 0; */
  position: relative;
  width: 100vw;
  height: auto;
  z-index: 999;
}
.discounts::after {
  content: ".";
  clear: both;
  display: block;
  overflow: hidden;
  font-size: 0;
  height: 0;
  zoom: 1;
}

.discounts {
  /* position: absolute;
  bottom: 0; */
  width: 100vw;
  background: #f6f6f6;
  max-height: 462px;
  padding-bottom: 0.8rem;
}
.checkout header {
  font-size: 18px;
  /* font-weight: bold; */
  background: #fff;
  text-align: center;
  height: 49px;
  line-height: 49px;
  width: 100vw;
}
.youhuijine {
  height: 35px;
  width: 100%;
  background: #fde8e5;
  font-size: 0.12rem;
  line-height: 35px;
  padding-left: 23px;
}
.youhuijine span {
  color: #f93e2c;
  /* font-weight: bold; */
}
.coupons-box {
  max-height: 2.8rem;
  overflow: auto;
  margin-bottom: 0.8rem;
}
.all_coupons {
  overflow: auto;
  height: auto;
}
.best-coupons,
.coupons,
.unable-coupons {
  overflow: hidden;
}
/* .coupons{
       
    } */
.coupon {
  width: 3.51rem;
  height: 0.98rem;
  float: left;
  margin-top: 10px;
  margin-left: 11px;
  background: url(../assets/coupon2.png) no-repeat;
  background-size: 100%;
  position: relative;
}
.u-coupon {
  width: 3.51rem;
  height: 0.98rem;
  float: left;
  margin-top: 10px;
  margin-left: 11px;
  background: url(../assets/nouse-coupon.png) no-repeat;
  background-size: 100%;
  position: relative;
}
.couponleft {
  width: 1.24rem;
  height: 0.98rem;
  position: absolute;
  top: 0;
  left: 0;
}
.coupon-left {
  color: #fff;
  width: 1.24rem;
  height: 0.98rem;
  position: absolute;
  top: 0;
  left: 0;
}
.coupon-left i {
  font-size: 0.17rem;
}
.coupon-left .sum {
  position: absolute;
  top: 0.21rem;
  width: 1.25rem;
  font-size: 0.29rem;
  text-align: center;
}
.coupon-left .amanjian {
  position: absolute;
  top: 0.64rem;
  width: 1.24rem;
  text-align: center;
  font-size: 0.12rem;
  letter-spacing: 1px;
}
.coupon-right {
  position: absolute;
  left: 1.24rem;
  top: 0;
  height: 0.99rem;
  width: 2.28rem;
}
.coupon-shop {
  font-size: 0.14rem;
  font-weight: bold;
  position: absolute;
  top: 0.12rem;
  left: 0.66rem;
}
.explain {
  font-size: 0.12rem;
  color: #999999;
  position: absolute;
  left: 0.2rem;
  top: 0.7rem;
}
.coupon-time {
  font-size: 0.12rem;
  color: #999999;
  position: absolute;
  top: 0.35rem;
  left: 0.2rem;
}
.coupon-choose {
  display: block;
  position: absolute;
  width: 18px;
  height: 18px;
  left: 1.95rem;
  top: 0.45rem;
  background: url("../assets/checked.png");
  background-size: 100%;
}
.coupon-no-choose {
  display: block;
  position: absolute;
  width: 18px;
  height: 18px;
  left: 1.95rem;
  top: 0.45rem;
  background: url("../assets/no-checked.png");
  background-size: 100%;
}

.confirm-box {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 0.8rem;
  font-size: 0.15rem;
  color: #fff;
  background: #fff;
  padding-left: 0.15rem;
  padding-top: 0.16rem;
}
.confirm {
  color: #fff;
  display: block;
  width: 3.45rem;
  height: 0.45rem;
  background: linear-gradient(
    90deg,
    rgba(254, 134, 88, 1),
    rgba(255, 23, 9, 1)
  );
  border-radius: 5px;
  text-align: center;
  line-height: 0.45rem;
}
</style>
