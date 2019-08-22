const app = getApp()

var baseUrl = 'http://192.168.1.3:8899/'

var list = null
var page = 1
var pSize = 20

Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_img_url: baseUrl + 'page_cover/',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '绘本详情',
    })
    let bid = options.bid;

    let url = baseUrl + 'bookinfo'
    var that = this
    wx.request({
      url: url,
      data: {
        'bid': bid
      },
      method: 'POST',
      success: function (result) {
        console.log(result.data.data)
        that.setData({
          picture_pages: result.data.data
        })
      },
      fail: function (res) {
        
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})