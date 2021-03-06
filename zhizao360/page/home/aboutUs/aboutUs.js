// page/home/aboutUs/aboutUs.js
var utils = require('../../../utils/util.js');
var app = getApp();

Page({
  data:{
    content:''
  },
  onLoad:function(options){
     var that = this;
     utils.BaseDataRequest({
      url:'GetAboutUs',
      callback:function(res){
       that.setData({
         content: app.globalData.rootUrl + res.data.Data.Content
       })
      }
    })
     
    // 页面初始化 options为页面跳转所带来的参数
  },
  onReady:function(){
    // 页面渲染完成
  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  }
})