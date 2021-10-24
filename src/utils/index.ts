const _b64_table =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const _hexcase = 0;
const _chrsz = 8;

function _b64_encode(data) {
  if (!data) {
    return data;
  }

  let o1,
    o2,
    o3,
    h1,
    h2,
    h3,
    h4,
    bits,
    i = 0,
    enc = "";
  do {
    o1 = data[i++];
    o2 = data[i++];
    o3 = data[i++];
    bits = (o1 << 16) | (o2 << 8) | o3;
    h1 = (bits >> 18) & 0x3f;
    h2 = (bits >> 12) & 0x3f;
    h3 = (bits >> 6) & 0x3f;
    h4 = bits & 0x3f;
    enc +=
      _b64_table.charAt(h1) +
      _b64_table.charAt(h2) +
      _b64_table.charAt(h3) +
      _b64_table.charAt(h4);
  } while (i < data.length);

  const r = data.length % 3;

  return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
}

function _b64_decode(data) {
  if (!data) {
    return data;
  }

  const result = [];
  let o1,
    o2,
    o3,
    h1,
    h2,
    h3,
    h4,
    bits,
    i = 0;

  data += "";

  do {
    h1 = _b64_table.indexOf(data.charAt(i++));
    h2 = _b64_table.indexOf(data.charAt(i++));
    h3 = _b64_table.indexOf(data.charAt(i++));
    h4 = _b64_table.indexOf(data.charAt(i++));
    bits = (h1 << 18) | (h2 << 12) | (h3 << 6) | h4;
    o1 = (bits >> 16) & 0xff;
    o2 = (bits >> 8) & 0xff;
    o3 = bits & 0xff;
    result.push(o1);
    if (h3 !== 64) {
      result.push(o2);
      if (h4 !== 64) {
        result.push(o3);
      }
    }
  } while (i < data.length);

  return result;
}

function _map(list, callback) {
  const output = [];
  for (let index = 0; index < list.length; index++) {
    output.push(callback(list[index], index));
  }
  return output;
}

function _keyCharAt(key, i) {
  return key.charCodeAt(Math.floor(i % key.length));
}

function _encode_utf8(s) {
  return unescape(encodeURIComponent(s));
}

function _decode_utf8(s) {
  return decodeURIComponent(escape(s));
}

function _xor_encrypt(key, data) {
  data = _encode_utf8(data);
  return _map(data, function (c, i) {
    return c.charCodeAt(0) ^ _keyCharAt(key, i);
  });
}

function _xor_decrypt(key, data) {
  return _map(data, function (c, i) {
    return String.fromCharCode(c ^ _keyCharAt(key, i));
  }).join("");
}

export function xor_encode(key, data) {
  data = _xor_encrypt(key, data);
  return _b64_encode(data);
}

export function xor_decode(key, data) {
  data = _b64_decode(data);
  return _decode_utf8(_xor_decrypt(key, data));
}

function _utf8_encode(string) {
  string = string.replace(/\r\n/g, "\n");
  let utftext = "";
  for (let n = 0; n < string.length; n++) {
    const c = string.charCodeAt(n);
    if (c < 128) {
      utftext += String.fromCharCode(c);
    } else if (c > 127 && c < 2048) {
      utftext += String.fromCharCode((c >> 6) | 192);
      utftext += String.fromCharCode((c & 63) | 128);
    } else {
      utftext += String.fromCharCode((c >> 12) | 224);
      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
      utftext += String.fromCharCode((c & 63) | 128);
    }
  }
  return utftext;
}

export function base64_encode(input) {
  let output = "";
  let chr1, chr2, chr3, enc1, enc2, enc3, enc4;
  let i = 0;
  input = _utf8_encode(input);
  while (i < input.length) {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output =
      output +
      _b64_table.charAt(enc1) +
      _b64_table.charAt(enc2) +
      _b64_table.charAt(enc3) +
      _b64_table.charAt(enc4);
  }
  return output;
}

function _binl2hex(binarray) {
  const hex_tab = _hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
  let str = "";
  for (let i = 0; i < binarray.length * 4; i++) {
    str +=
      hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8 + 4)) & 0xf) +
      hex_tab.charAt((binarray[i >> 2] >> ((i % 4) * 8)) & 0xf);
  }
  return str;
}

function _safe_add(x, y) {
  const lsw = (x & 0xffff) + (y & 0xffff);
  const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xffff);
}

function _bit_rol(num, cnt) {
  return (num << cnt) | (num >>> (32 - cnt));
}

function _md5_cmn(q, a, b, x, s, t) {
  return _safe_add(_bit_rol(_safe_add(_safe_add(a, q), _safe_add(x, t)), s), b);
}

function _md5_ff(a, b, c, d, x, s, t) {
  return _md5_cmn((b & c) | (~b & d), a, b, x, s, t);
}

function _md5_gg(a, b, c, d, x, s, t) {
  return _md5_cmn((b & d) | (c & ~d), a, b, x, s, t);
}

function _md5_hh(a, b, c, d, x, s, t) {
  return _md5_cmn(b ^ c ^ d, a, b, x, s, t);
}

function _md5_ii(a, b, c, d, x, s, t) {
  return _md5_cmn(c ^ (b | ~d), a, b, x, s, t);
}

function _core_md5(x, len) {
  x[len >> 5] |= 0x80 << len % 32;
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let i = 0; i < x.length; i += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = _md5_ff(a, b, c, d, x[i], 7, -680876936);
    d = _md5_ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = _md5_ff(c, d, a, b, x[i + 2], 17, 606105819);
    b = _md5_ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = _md5_ff(a, b, c, d, x[i + 4], 7, -176418897);
    d = _md5_ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = _md5_ff(c, d, a, b, x[i + 6], 17, -1473231341);
    b = _md5_ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = _md5_ff(a, b, c, d, x[i + 8], 7, 1770035416);
    d = _md5_ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = _md5_ff(c, d, a, b, x[i + 10], 17, -42063);
    b = _md5_ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = _md5_ff(a, b, c, d, x[i + 12], 7, 1804603682);
    d = _md5_ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = _md5_ff(c, d, a, b, x[i + 14], 17, -1502002290);
    b = _md5_ff(b, c, d, a, x[i + 15], 22, 1236535329);

    a = _md5_gg(a, b, c, d, x[i + 1], 5, -165796510);
    d = _md5_gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = _md5_gg(c, d, a, b, x[i + 11], 14, 643717713);
    b = _md5_gg(b, c, d, a, x[i], 20, -373897302);
    a = _md5_gg(a, b, c, d, x[i + 5], 5, -701558691);
    d = _md5_gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = _md5_gg(c, d, a, b, x[i + 15], 14, -660478335);
    b = _md5_gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = _md5_gg(a, b, c, d, x[i + 9], 5, 568446438);
    d = _md5_gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = _md5_gg(c, d, a, b, x[i + 3], 14, -187363961);
    b = _md5_gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = _md5_gg(a, b, c, d, x[i + 13], 5, -1444681467);
    d = _md5_gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = _md5_gg(c, d, a, b, x[i + 7], 14, 1735328473);
    b = _md5_gg(b, c, d, a, x[i + 12], 20, -1926607734);

    a = _md5_hh(a, b, c, d, x[i + 5], 4, -378558);
    d = _md5_hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = _md5_hh(c, d, a, b, x[i + 11], 16, 1839030562);
    b = _md5_hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = _md5_hh(a, b, c, d, x[i + 1], 4, -1530992060);
    d = _md5_hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = _md5_hh(c, d, a, b, x[i + 7], 16, -155497632);
    b = _md5_hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = _md5_hh(a, b, c, d, x[i + 13], 4, 681279174);
    d = _md5_hh(d, a, b, c, x[i], 11, -358537222);
    c = _md5_hh(c, d, a, b, x[i + 3], 16, -722521979);
    b = _md5_hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = _md5_hh(a, b, c, d, x[i + 9], 4, -640364487);
    d = _md5_hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = _md5_hh(c, d, a, b, x[i + 15], 16, 530742520);
    b = _md5_hh(b, c, d, a, x[i + 2], 23, -995338651);

    a = _md5_ii(a, b, c, d, x[i], 6, -198630844);
    d = _md5_ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = _md5_ii(c, d, a, b, x[i + 14], 15, -1416354905);
    b = _md5_ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = _md5_ii(a, b, c, d, x[i + 12], 6, 1700485571);
    d = _md5_ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = _md5_ii(c, d, a, b, x[i + 10], 15, -1051523);
    b = _md5_ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = _md5_ii(a, b, c, d, x[i + 8], 6, 1873313359);
    d = _md5_ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = _md5_ii(c, d, a, b, x[i + 6], 15, -1560198380);
    b = _md5_ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = _md5_ii(a, b, c, d, x[i + 4], 6, -145523070);
    d = _md5_ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = _md5_ii(c, d, a, b, x[i + 2], 15, 718787259);
    b = _md5_ii(b, c, d, a, x[i + 9], 21, -343485551);

    a = _safe_add(a, olda);
    b = _safe_add(b, oldb);
    c = _safe_add(c, oldc);
    d = _safe_add(d, oldd);
  }
  return [a, b, c, d];
}

function _str2binl(str) {
  const bin = [];
  const mask = (1 << _chrsz) - 1;
  for (let i = 0; i < str.length * _chrsz; i += _chrsz)
    bin[i >> 5] |= (str.charCodeAt(i / _chrsz) & mask) << i % 32;
  return bin;
}

export function md5(s) {
  return _binl2hex(_core_md5(_str2binl(s), s.length * _chrsz));
}

// 参数排序
export function paramSort(body_map) {
  const newKey = Object.keys(body_map).sort();
  // 创建新对象，用于存放排序好的键值对
  const newObj = {};
  let bodyJson = "";
  // 遍历newKey数组
  for (let i = 0; i < newKey.length; i++) {
    // 向新创建的对象中按照排好的顺序依次增加键值对
    newObj[newKey[i]] = body_map[newKey[i]];
  }
  Object.keys(newObj).forEach(function (key) {
    bodyJson += key + "=" + newObj[key] + "&";
  });
  return bodyJson;
}

// sign签名
function md5Sign(body_map, time, xor_key) {
  const bodyJson = paramSort(body_map);
  const timeAndKey = md5(time + xor_key);
  return md5(bodyJson + timeAndKey);
}

/**
 * 获取当前时间戳
 * @param sec 是否精确到秒
 */
export function timestamp(sec = true): number {
  const timestamp = Date.parse(new Date().toString());
  return sec ? timestamp / 1000 : timestamp;
}

// 请求头信息
export function headerContent(code = "", config, systemInfo) {
  const { app_id, ad_id, xor_key } = config;
  const time = timestamp();
  const obj = {
    appid: app_id,
    adid: ad_id,
    time,
  };
  if (code) Object.assign(obj, { code });
  Object.assign(obj, systemInfo);
  // sign签名
  Object.assign(obj, { sign: md5Sign(obj, time, xor_key) });
  // obj->string
  return JSON.stringify(obj);
}

export function getParam(url, paramName) {
  const query = url.substr(url.indexOf("?") + 1);
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split("=");
    if (pair[0] === paramName) {
      return unescape(pair[1]);
    }
  }
  return "";
}
