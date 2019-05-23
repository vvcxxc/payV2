/**
 * cookie
 */

export let Cookie = {
    set(name, val, expires, path) {
      var str = name + '=' + val
      if (expires) {
        str += ';expires=' + expires.toUTCString()
      }
      if (path) {
        str += ';path=' + path
      }
      document.cookie = str
    },
    remove(name, path) {
      var now = new Date()
      now.setDate(now.getDate() - 7)
      this.set(name, 'null', now, path)
    },
    get(name) {
      var res = ''
      var cookies = document.cookie
      if (!cookies.length) return res
      cookies = cookies.split('; ')
      for (var i = 0; i < cookies.length; i++) {
        var arr = cookies[i].split('=')
        if (arr[0] === name) {
          res = arr[1]
          break
        }
      }
      return res
    }
  }
  
  /**
   * 表单校验
   */
  
  export class Validator {
    constructor() {
      this.cache = []
      this.strategies = {
        isEmpty(val, errmsg) {
          if (!val.trim()) return errmsg
        },
        isMoney(val, errmsg) {
          if (+val == 0 || isNaN(+val)) return errmsg
        },
        isMobileError(val, errmsg) {
          if (!/^1[34678]\d{9}$/.test(val)) return errmsg
        },
        isLengthError(val, len, errmsg) {
          if (val.length < len) return errmsg
        },
        isLike(newVal, originVal, errmsg) {
          if (newVal === originVal) return errmsg
        },
        isUnLike(newVal, originVal, errmsg) {
          if (newVal !== originVal) return errmsg
        },
        isLetterBegin(val, errmsg) {
          if (!/^[a-z]{1}/.test(val)) return errmsg
        }
      }
    }
    add(val, rules) {
      for (let i = 0, item; (item = rules[i++]); ) {
        let { validateRule, params, errmsg } = item
  
        let args = params ? [val, params, errmsg] : [val, errmsg]
  
        this.cache.push(() => this.strategies[validateRule].apply(null, args))
      }
    }
    start() {
      let result
      for (let i = 0; i < this.cache.length; i++) {
        result = this.cache[i]()
        if (result) return result
      }
    }
  }

  /**
   * 
   * 对象中的某个键值排序，从大到小
   */
  export function Compare(protopy){
    return function(a,b){
        var value1 = a[protopy];
        var value2 = b[protopy];
        return value2 - value1;
    }
}

/**
 * 对象中的某个键值排序，从小到大
 */
export function CompareSmall(protopy){
  return function(a,b){
      var value1 = a[protopy];
      var value2 = b[protopy];
      return value1 - value2;
  }
}

/**
 * 
 * 数组的去重
 */
export function RemoveDup(arr){
  var hash=[];
  for (var i = 0; i < arr.length; i++) {
     if(hash.indexOf(arr[i])==-1){
      hash.push(arr[i]);
     }
  }
  return hash;
}

/**
 * 
 * 数组对象的合并去重
 */
  export function NewArrObj(aa,ab){
    return aa.concat(ab).filter(function(v, i, arr) {
 
      return arr.indexOf(v) === arr.lastIndexOf(v);

  });

    
  }