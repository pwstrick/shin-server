import moment from 'moment';

/**
 * 随机字符串
 * @export
 * @param {number} len 字符串长度
 * @returns
 */
export function randomString(len) {
  const length = len || 32;
  const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const maxPos = $chars.length;
  let pwd = '';
  for (let i = 0; i < length; i += 1) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}

/**
 * 延迟执行
 * @export
 * @param {number} ms 延迟时间
 * @returns
 */
export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 *  身份证、 邮箱、 银行卡、 手机号加密
 * @param str string
 */
export function encrypt(str, num) {
  if (str) {
    const number = num || 0;
    const length = str.length;
    const hideLen = Math.floor(length / 2) - number;
    const offset = (length - hideLen) / 2;
    const head = str.slice(0, offset);
    const tail = str.slice(offset + hideLen, length);
    let star = '';
    for (let i = 0; i < hideLen; i += 1) {
      star += '*';
    }
    return head + star + tail;
  }
  return str;
}

/**
 * 日期格式
 */
export function utcToDate(date, format="YYYY-MM-DD HH:mm:ss") {
  return moment(date).utcOffset(480).format(format);
}

/**
 * 10进制转62进制
 */
export function string10to62(n) {
    if (n === 0) {
      return "0";
    }
    var digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    while (n > 0) {
      result = digits[n % digits.length] + result;
      n = parseInt(n / digits.length, 10);
    }
    return result;
}
  
/**
 * 62进制转10进制
 */
export function string62to10(s) {
    var digits = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = 0;
    for (var i = 0; i < s.length; i++) {
      var p = digits.indexOf(s[i]);
      if (p < 0) {
        return NaN;
      }
      result += p * Math.pow(digits.length, s.length - i - 1);
    }
    return result;
}