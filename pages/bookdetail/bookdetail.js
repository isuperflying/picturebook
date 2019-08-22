const app = getApp()
var baseUrl = 'http://192.168.80.97:8899/'
var list = null
var page = 1
var pSize = 20
var currentReadPage = 0;

const innerAudioContext = wx.createInnerAudioContext()
var vowel_audio_src
var isPlay = false
var current_index;
var bookPages
var currentObj
Page({

  /**
   * 页面的初始数据
   */
  data: {
    musicStatus: 'on',
    base_img_url: baseUrl + 'page_cover/',
    play_img:'../../images/btn_play_normal.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    let bid = options.bid;
    let title = options.title;
    wx.setNavigationBarTitle({
      title: title,
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

  },

  preBooImage:function(e){
    if(bookPages){
      let tempUrl = this.data.base_img_url + bookPages[currentReadPage].picture_url_local
      wx.previewImage({
        urls: [tempUrl],
        current: tempUrl
      })
    }
   
  },
  changeBookPage:function(e){
      console.log(e.detail.current)
      currentReadPage = e.detail.current
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
      
  },


  playMusic(src, loop = false) {
    if (this.data.musicStatus != "on") {
      this.stopMusic()
      return
    }
    isPlay = true
    
    innerAudioContext.src = src
    innerAudioContext.loop = loop
    innerAudioContext.play()

    //播放结束
    innerAudioContext.onEnded(() => {
      isPlay = false
      this.setData({
        play_img: '../../images/btn_play_normal.png',
      })
    })
  },

  stopMusic() {
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
      this.loopInnerAudioContext.stop()
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
    if (bookPages) {
      currentReadPage++
      if (currentReadPage < bookPages.length) {
        this.setCurrentPage();
      } else {
        currentReadPage = bookPages.length - 1
      }
    }
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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})