const app = getApp()
let wechat = require('../../utils/wechat.js');
var baseUrl = 'https://www.antleague.com/picturebook/'
var list = null
var page = 1
var pSize = 20
var currentReadPage = 0;

const innerAudioContext = null;
var vowel_audio_src
var isPlay = false
var current_index;
var bookPages
var currentObj

let userInfo
var user_is_vip = false
var current_system
var free_count = 1000;
var bid;
var bidtitle;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musicStatus: 'on',
    showModal:false,
    showVipModal:false,
    base_img_url: baseUrl + 'page_cover/',
    play_img:'../../images/btn_play_normal.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('onLoad--->');
    //当前的系统版本
    wx.getSystemInfo({
      success(res) {
        current_system = res.platform
        console.log(current_system)
      }
    });

    userInfo = app.globalData.userInfo || wx.getStorageSync('user_info')
    currentReadPage = 0;

    if(userInfo){
      user_is_vip = userInfo.is_vip == 1 ? true : false
    }

    bid = options.bid;
    bidtitle = options.title;
    wx.setNavigationBarTitle({
      title: bidtitle,
    })
    let url = baseUrl + 'bookinfo'
    var that = this
    wx.request({
      url: url,
      data: {
        'bid': bid
      },
      method: 'POST',
      success: function (result) {
        console.log(result.data)
        //免费学习的书本页数
        free_count = result.data.free_count;
        bookPages = result.data.data
        console.log(bookPages)

        that.setData({
          currentReadPage,
          picture_pages: result.data.data,
          current_page:currentReadPage + 1,
          total_page: bookPages.length,
          enText: bookPages[currentReadPage].audio_en_text,
          cnText: bookPages[currentReadPage].audio_cn_text
        })
        vowel_audio_src = bookPages[currentReadPage].audio_url_server
      },
      fail: function (res) {
        
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('onReady--->');
  },
  
  onShow:function(){
    console.log('onShow--->');
  },
  preBooImage:function(e){
    if(bookPages){
      let tempUrl = bookPages[currentReadPage].picture_url_server
      wx.previewImage({
        urls: [tempUrl],
        current: tempUrl
      })
    }
   
  },
  changeBookPage:function(e){
      console.log(e.detail.current)
      currentReadPage = e.detail.current
      console.log('currentReadPage--->' + currentReadPage)

      if (!user_is_vip && currentReadPage + 1 > free_count && current_system != 'ios'){
          this.setData({
            showVipModal:true
          })
          return;
      }

      this.setCurrentPage();
  },

  setCurrentPage: function () {
    console.log('current_index--->' + currentReadPage)
    
    currentObj = bookPages[currentReadPage]
    vowel_audio_src = currentObj.audio_url_server

    console.log('current audio--->' + vowel_audio_src)

    this.setData({
      currentReadPage,
      current_page: currentReadPage + 1,
      enText: bookPages[currentReadPage].audio_en_text,
      cnText: bookPages[currentReadPage].audio_cn_text
    });
    
    if(this.data.current_page == bookPages.length && wx.getStorageSync(key)){
      this.setData({
        showModal:true
      })
      wx.setStorageSync(bid, true)
    }
  },


  playMusic(src, loop = false) {
    console.log('this.data.musicStatus--->' + this.data.musicStatus)
    if (this.data.musicStatus != "on") {
      this.stopMusic()
      return
    }
    isPlay = true
    this.innerAudioContext = wx.createInnerAudioContext()
    this.innerAudioContext.src = src
    this.innerAudioContext.loop = loop
    this.innerAudioContext.play()

    //播放结束
    this.innerAudioContext.onEnded(() => {
      isPlay = false
      this.setData({
        play_img: '../../images/btn_play_normal.png',
      })
    })
  },
  
  stopMusic() {
    console.log(this.innerAudioContext)
    if (this.innerAudioContext) {
      console.log('stop music --->')
      this.innerAudioContext.stop()
    }
    isPlay = false;
    this.setData({
      play_img: '../../images/btn_play_normal.png'
    })
  },

  invisiable() {
    this.data.musicStatus = "off"
    this.stopMusic();
    if (this.loopInnerAudioContext) {
      this.innerAudioContext.stop()
    }
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }
  },

  playBook: function () {
    console.log('play book--->' + isPlay)
    if (isPlay) {
      this.stopMusic()
    } else {
      this.setData({
        play_img: '../../images/btn_pause_normal.png'
      })
      this.playMusic(vowel_audio_src, false)
    }
  },

  preBook: function () {
    this.stopMusic();
    
    if (bookPages) {
      currentReadPage--
      if (currentReadPage > -1) {
        this.setCurrentPage();
      } else {
         currentReadPage = 0;
      }
    }
  },

  nextBook: function () {
    this.stopMusic();
    if (bookPages) {
      currentReadPage++

      if (!user_is_vip && currentReadPage + 1 > free_count && current_system != 'ios') {
        this.setData({
          showVipModal: true
        })
        return;
      }

      if (currentReadPage < bookPages.length) {
        this.setCurrentPage();
      } else {
        currentReadPage = bookPages.length - 1
      }
    }
  },

  userLogin: function (e) {
    this.getUserInfo();
  },

  getUserInfo() {
    userInfo = app.globalData.userInfo || wx.getStorageSync('user_info')
    console.log(userInfo)

    if (userInfo) {
      user_is_vip = userInfo.is_vip == 1 ? true : false
    }

    //如果用户已经登录过，直接生成
    if (userInfo) {

      this.setData({
        showVipModal: false
      })

      if(!user_is_vip){
        this.vipBuy();
      }

    } else {
      var that = this
      wechat.getCryptoData2()
        .then(d => {
          return wechat.getMyData(d);
        })
        .then(d => {
          console.log("从后端获取的用户信息--->", d.data);
          userInfo = d.data.data
          wechat.saveUserInfo(userInfo)
          app.globalData.userInfo = userInfo
          that.data.is_login = true
          if (userInfo) {
            user_is_vip = userInfo.is_vip == 1 ? true : false
          }
          
          console.log('user_is_vip--->' + user_is_vip)

          if(!user_is_vip){
            that.vipBuy();
          }else{
            that.setData({
              showVipModal: false
            });
          }
        })
        .catch(e => {
          console.log(e);
        })
    }
  },

  vipBuy: function () {
    var that = this
    wx.request({
      url: baseUrl + 'getpayinfo',
      method: 'POST',
      data: {
        openid: userInfo.openId,
        token: userInfo.token
      },
      success: function (res) {
        console.log(res.data)
        if (res.data.code == 0) {
          var timestamp = res.data.data.timestamp + '' //时间戳
          var nonceStr = res.data.data.nonceStr //随机数
          var packages = res.data.data.package //prepay_id
          var paySign = res.data.data.paySign //签名
          var signType = 'MD5'

          wx.requestPayment({
            timeStamp: timestamp,
            nonceStr: nonceStr,
            package: packages,
            signType: signType,
            paySign: paySign,
            success: function (res) {
              console.log('pay success----')
              //console.log(res)
              wx.showToast({
                title: '购买成功',
                icon: 'none'
              })
              //支付成功后更改用户的VIP状态
              user_is_vip = true
              if (userInfo) {
                userInfo.is_vip = 1
                wechat.saveUserInfo(userInfo)
                app.globalData.userInfo = userInfo
              }

              that.setData({
                showVipModal: false
              });

              //继续生成
              //that.create1();
            },
            fail: function (res) {
              console.log('pay fail----')
              console.log(res)
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              })
              currentReadPage--;

              that.setData({
                currentReadPage
              })
            }
          })
        } else {
          wx.showToast({
            title: '数据异常，请重试',
            icon: 'none'
          })
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

  /**
  * 生命周期函数--监听页面隐藏
  */
  onHide: function () {
    this.invisiable()
  },

  /**
   * 生命周期函数--监听页面卸载
   */

  onUnload: function () {
    this.invisiable()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () { },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    console.log("hide");
    this.setData({
      showModal: false
    });
  },

  hideVipModal: function () {
    console.log("vip hide");
    currentReadPage--;
    this.setData({
      showVipModal: false,
      currentReadPage
    });
  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    return {
      title: '糖果绘本，让宝宝快乐阅读!',
      path: '/pages/bookdetail/bookdetail?bid=' + bid + '&title=' + bidtitle
    }
  }
})