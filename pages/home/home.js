const app = getApp()

var baseUrl = 'http://192.168.80.97:8899/'

var list = null
var page = 1
var pSize = 20
var isEnd
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_img_url: baseUrl + 'book_cover/',
    base_video_url: baseUrl + 'book_mp3/',
    banner: [
      { 'img_url': '../../images/bb1.jpg' }, 
      { 'img_url': '../../images/bb2.jpg' }, 
      { 'img_url': '../../images/bb3.jpg' }],
    ageslist: [{
        'type':'1',
        'img_url': '../../images/0-1.png',
        'title': '0-1岁'
      },
      {
        'type': '2',
        'img_url': '../../images/1-2.png',
        'title': '1-2岁'
      },
      {
        'type': '3',
        'img_url': '../../images/2-3.png',
        'title': '2-3岁'
      },
      {
        'type': '4',
        'img_url': '../../images/3-4.png',
        'title': '3-4岁'
      },
      {
        'type': '5',
        'img_url': '../../images/4-5.png',
        'title': '4-5岁'
      },
      {
        'type': '6',
        'img_url': '../../images/5-6.png',
        'title': '5-6岁'
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '糖果绘本',
    })
    wx.showLoading({
      title: '加载中',
    })
    this.loadData();
  },

  onShow: function(e) {

  },

  loadData: function() {
    var that = this
    let url = baseUrl + 'booklist'
    wx.request({
      url: url,
      data: {
        'typeid': 0,
        'page': page
      },
      method: 'POST',
      success: function(result) {
        wx.hideLoading()
        wx.stopPullDownRefresh();
        console.log(result.data.data)

        if (page == 1) {
          list = result.data.data;
        } else {
          if (list != null) {
            list = list.concat(result.data.data);
          }
          if (result.data.data.length < 20) {
            isEnd = true
          }

        }

        that.setData({
          videolist: list
        })
      },
      fail: function (res) {
        wx.hideLoading()
        wx.stopPullDownRefresh()
      }
    })
  },

  /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
  onPullDownRefresh: function () {
    page = 1
    this.data.videolist = null
    this.loadData()
  },

  onReachBottom: function(e) {
    if(page > 3){
      return;
    }
    page++;
    this.loadData();
  },

  bookdetail: function(e) {
    var bid = e.currentTarget.dataset.bid
    console.log('bookid--->' + bid)
    wx.navigateTo({
      url: '/pages/bookdetail/bookdetail?bid=' + bid + '&title=' + e.currentTarget.dataset.title
    })
  },

  banner:function(e){
    var typeid = 1
    var type_name = '热门'
    wx.navigateTo({
      url: '/pages/category/category?typeid=' + typeid + '&type_name=' + type_name
    })
  },
  category:function(e){
    var typeid = e.currentTarget.dataset.typeid
    var type_name = e.currentTarget.dataset.title
    wx.navigateTo({
      url: '/pages/category/category?typeid=' + typeid + '&type_name=' + type_name
    })
  },

  onShareAppMessage: function () {
    return {
      title: '糖果绘本，宝宝快乐的源泉!',
      path: '/pages/home/home',
      imageUrl: '/images/share_img.png'
    }
  },

  version: function () {
    var text = '糖果绘本所有内容都采集于网络,' +
      '仅为网友提供信息交流的平台。糖果绘本自身不控' +
      '制、编辑或修改任何资源信息。如果正在使用的视频及其他的资源侵犯了你的' +
      '作品著作权，请个人或单位务必以书面的通讯方式向作者' +
      '提交权利通知。本程序一定积极配合下架资源处理。'
    wx.showModal({
      title: '免责申明',
      content: text,
      showCancel: false,
      success: function (res) {
        if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }
})