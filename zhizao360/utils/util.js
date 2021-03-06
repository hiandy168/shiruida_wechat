var app = require('../app.js');
var appInstance = getApp(); //获取全局对象

function formatTime(time) {
  if (typeof time !== 'number' || time < 0) {
    return time
  }

  var hour = parseInt(time / 3600)
  time = time % 3600
  var minute = parseInt(time / 60)
  time = time % 60
  var second = time

  return ([hour, minute, second]).map(function (n) {
    n = n.toString()
    return n[1] ? n : '0' + n
  }).join(':')
}

function formatLocation(longitude, latitude) {
  if (typeof longitude === 'string' && typeof latitude === 'string') {
    longitude = parseFloat(longitude)
    latitude = parseFloat(latitude)
  }

  longitude = longitude.toFixed(2)
  latitude = latitude.toFixed(2)

  return {
    longitude: longitude.toString().split('.'),
    latitude: latitude.toString().split('.')
  }
}

var rootUrl = appInstance.globalData.rootUrl + '/wxapi/';
function request(obj) {
  // var  obj = {         参数格式
  //     url:obj.url ,
  //     method:obj.method,
  //     data:obj.data,
  //     callback:obj.callback
  // } 
  var cookie = wx.getStorageSync('cookie');
  var code = wx.getStorageSync('code');
  var rd_session = wx.getStorageSync('rd_session');
  wx.request({
    url: obj.url,
    method: obj.method || 'GET',
    data: obj.data || {},
    header: obj.header || {
      cookie: cookie,
      'X-WX-Code': code,
      rd_session: rd_session
    },
    success: function (res) {
      if (res.isImLogin != undefined && !res.isImLogin) {
        app.getUserInfo();
      }
      else {
        typeof obj.callback == 'function' && obj.callback(res);
      }
    }
  })
}
// BaseData/ 基础数据
function BaseDataRequest(obj) {
  obj.url = rootUrl + 'BaseData/' + obj.url;
  request(obj)
}

// Device/
function DeviceRequest(obj) {
  obj.url = rootUrl + 'Device/' + obj.url;
  request(obj)
}

// User/
function UserRequest(obj) {
  obj.url = rootUrl + 'User/' + obj.url;
  request(obj);
}

// Enterprise/
function EnterpriseRequest(obj) {
  obj.url = rootUrl + 'Enterprise/' + obj.url;
  request(obj);
}

// EnterpriseImage/
function EnterpriseImageRequest(obj) {
  obj.url = rootUrl + 'EnterpriseImage/' + obj.url;
  request(obj);
}

// MemberInfo/
function MemberInfoRequest(obj) {
  obj.url = rootUrl + 'MemberInfo/' + obj.url;
  request(obj);
}
//循环保留距离一位小数。循环取主营行业。循环判断是否有工厂图片
function distanc(data, header) {
  for (var i = 0; i < data.length; i++) {
    if (data[i].Distance != 0) {
      data[i].Distance = parseFloat(data[i].Distance).toFixed(1);
    }
    //闲置数量
    if (header.pageId == 1) {
      for (var j = 0; j < data[i].Devices.length; j++) {
        if (data[i].Devices[j].Amount > 999) {
          data[i].Devices[j].Amount = "999+"
        }
        if (data[i].Devices[j].NotBusyQty > 999) {
          data[i].Devices[j].NotBusyQty = "999+"
        }
        if (DataTime(data[i].Devices[j].NotBusyQtyUpdateTime)) {
          data[i].Devices.splice(j, 1);     //删除发布超过三天
        }
      }
      if (data[i].Devices.length == 0) {
        data.splice(i, 1);  //删除没有限制产能
      }
    }
    if (header.pageId == 2) {
      //主营行业
      if (data[i].MainIndesutry != null) {
        //根据二级行业ID找一级二级行业名称
        for (var j = 0; j < header.MainIndustryArray.length; j++) {
          for (var k = 0; k < header.MainIndustryArray[j].SubIndustries.length; k++) {
            if (data[i].MainIndesutry == header.MainIndustryArray[j].SubIndustries[k].Id) {
              data[i].MainIndesutry = header.MainIndustryArray[j].Name + ">" + header.MainIndustryArray[j].SubIndustries[k].Name;
            }
          }
        }
      }
      //企业工厂图片
      if (data[i].FactoryCover == '') {
        data[i].FactoryCover = '../../icon/supplier-img.png';
      } else {
        data[i].FactoryCover = appInstance.globalData.rootUrl + data[i].FactoryCover;
      }
    }
  }
  return data;
}

function DataTime(UpdateTime) {
  var EndTime = 3 * 24 * 60 * 60 * 1000;//3天
  var nowTime = new Date();
  var Seconds = nowTime.getTime();
  var time = UpdateTime.replace("/Date(", "").replace(")/", "");
  if ((Seconds - time) > EndTime) {
    return true;
  } else {
    return false;
  }
}

function TipModel(content) {
  wx.showModal({
    title: '提示',
    content: content,
    showCancel: false,
  })
}

module.exports = {
  formatTime: formatTime,
  formatLocation: formatLocation,

  request: request,
  BaseDataRequest: BaseDataRequest,
  DeviceRequest: DeviceRequest,
  UserRequest: UserRequest,
  EnterpriseRequest: EnterpriseRequest,
  MemberInfoRequest: MemberInfoRequest,
  EnterpriseImageRequest: EnterpriseImageRequest,
  distanc: distanc,
  TipModel: TipModel
}