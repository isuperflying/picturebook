const app = getApp()

var baseUrl = 'http://192.168.80.97:8899/'

var list = null
var page = 1
var pSize = 20
var typeid
var isEnd = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    base_img_url: baseUrl + 'book_cover/',
    base_video_url: baseUrl + 'book_mp3/',
    is_end: isEnd
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: options.type_name + '儿歌',
    })
    page = 1
    typeid = options.typeid
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
        'page': page,
        'typeid': typeid
      },
      method: 'POST',
      success: function(result) {
        console.log(result.data.data)
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (page == 1) {
          list = result.data.data;
        } else {
          if (list != null) {
            list = list.concat(result.data.data);
          }
          if (result.data.data.length < 20){
            isEnd = true
          }

          that.setData({
            is_end: isEnd
          })
        }

        that.setData({
          videolist: list
        })
      },
      fail: function(res) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
      }
    })
  },

  onPullDownRefresh: function() {
    list = null
    page = 1
    this.data.videolist = null
    this.loadData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (!isEnd){
      wx.showLoading({
        title: '加载中',
      })
      page++;
      this.loadData();
    }
  },

  bookdetail: function (e) {
    var bid = e.currentTarget.dataset.bid
    console.log('bookid--->' + bid)
    wx.navigateTo({
      url: '/pages/bookdetail/bookdetail?bid=' + bid + '&title=' + e.currentTarget.dataset.title
    })
  },

  onShareAppMessage: function() {
    return {
      title: '儿歌乐园，宝宝的快乐源泉!',
      path: '/pages/home/home',
      imageUrl: '/images/share_img.png'
    }
  }
})