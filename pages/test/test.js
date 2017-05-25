var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({
  data: {
    markers: [{
      iconPath: "/resources/qing.png",
      id: 0,
      latitude: 23.10229,
      longitude: 113.324520,
      width: 42,
      height: 47,
      showName: "",
      phone: "",
      intro: "",
    }],
    // polyline: [{
    //   points: [{
    //     longitude: 113.3245211,
    //     latitude: 23.10229
    //   }, {
    //     longitude: 113.324520,
    //     latitude: 23.21229
    //   }],
    //   color: "#FF0000DD",
    //   width: 10,
    //   dottedLine: true
    // }],
    controls: [],
    scale: 14,
    myLat: 0,
    myLng: 0,
    tmpLat: 0,
    tmpLng: 0,
    showDialog: false,
    screenHeight: 0,
    currentItem: null,
    showAddDialog: false,
    //ShowName
    show_name: "",
    //Phone
    phone: "",
    intro: "",
    // markers_pics: [
    //   '/resources/qing.png',
    //   '/resources/yu.png',
    //   '/resources/xian.png',
    //   '/resources/shi.png',
    // ],
    searchActive: "",
    width: 55,
    inputShowed: false,
    inputVal: "",
    searchResults: null,
  },
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap');
    this.countTap = 0;
    this.lastTime = 0;
    this.getLngLat();
  },
  onLoad: function () {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: 'QP4BZ-N223U-36BVX-2AC6J-RJUNJ-22BVM'
    });
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
        })
      },
    });
    //显示中心的添加按钮
    this.setData({
      controls: [{
        id: 1,
        iconPath: '/resources/location.png',
        position: {
          left: this.data.screenWidth / 2 - 25,
          top: (this.data.screenHeight - 54 - 54) / 2 - 54,
          width: 48,
          height: 54
        },
        clickable: true
      }],
    });
    wx.getLocation({
      success: function (res) {
        that.setData({
          myLat: res.latitude,
          myLng: res.longitude
        });
      },
    });
  },
  onShow: function () {

  },
  //获取中间点经纬度,并发送请求
  getLngLat: function () {
    var that = this;
    this.mapCtx = wx.createMapContext("myMap");
    this.mapCtx.getCenterLocation({
      success: function (res0) {
        that.setData({
          tmpLat: res0.latitude,
          tmpLng: res0.longitude
        });

        wx.request({
          url: "http://127.0.0.1:9000/markers",
          data: {
            //加入scale参数
            // scale: that.data.scale,
            lat: res0.latitude,
            lng: res0.longitude
          },
          success: function (res) {
            console.log(res.data.markers);
            var ms = [];
            for (var i = 0; i < res.data.markers.length; i++) {
              var m = res.data.markers[i];
              var s = {};
              s["latitude"] = m.lat;
              s["longitude"] = m.lng;
              s["id"] = i;
              var j = res.data.markers[i].logo_index;
              s["iconPath"] = "/resources/marker.png";
              s["width"] = 48;
              s["height"] = 46;
              s["showName"] = m.show_name;
              s["intro"] = m.intro;
              s["phone"] = m.phone;
              ms[i] = s;
            }
            that.setData({
              markers: ms
            })
          }
        });
      }
    })
  },
  regionchange(e) {
    console.log(e)
    if (e.type == 'end') {
      this.getLngLat()
    }
  },
  markertap(e) {
    //普通marker
    if (this.data.showDialog) {
      this.setData({
        showDialog: !this.data.showDialog
      })
    } else {
      this.setData({
        showDialog: !this.data.showDialog
      })
      console.log(e.markerId)
      console.log(this.data.markers[e.markerId])
      this.setData({
        currentItem: this.data.markers[e.markerId]
      })
    }
  },
  controltap(e) {
    console.log(e.controlId)
    this.setData({
      showAddDialog: true
    });
  },
  closeAddDialog(e) {
    this.setData({
      showAddDialog: false
    });
  },
  submit(e) {
    //提交新marker
    var that = this;
    wx.request({
      method: "post",
      data: {
        lat: this.data.tmpLat,
        lng: this.data.tmpLng,
        show_name: this.data.show_name,
        phone: this.data.phone,
        intro: this.data.intro,
        // logo_index: index
      },
      url: 'http://127.0.0.1:9000/markers/add',
      success: function (res) {
        if (res.data.status == "ok") {
          var ms = that.data.markers;
          ms[ms.length] = {
            iconPath: "/resources/marker.png",
            id: 0,
            latitude: that.data.tmpLat,
            longitude: that.data.tmpLng,
            width: 42,
            height: 47,
            showName: that.data.show_name,
            phone: that.data.phone,
            intro: that.data.intro,
          };
          that.setData({
            markers: ms,
            //关闭弹窗
            showAddDialog: false
          });
        }
      }
    });
  },
  InputShowName(e) {
    this.setData({
      show_name: e.detail.value
    });
  },
  InputPhone(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  InputIntro(e) {
    this.setData({
      intro: e.detail.value
    });
  },
  tapMap(e) {
    console.log("tapMap");
  },
  // searchToggle(e) {
  //   console.log(e);
  //   if (this.data.searchActive == "") {
  //     this.setData({
  //       searchActive: "activie"
  //     });
  //   } else {
  //     this.setData({
  //       searchActive: ""
  //     })
  //   }
  // },
  // focusInput(e) {
  //   console.log(e)
  //   this.setData({
  //     width: 130
  //   })
  // },
  // doSearch(e) {
  //   console.log(e);
  // },
  // hideSearch(e) {
  //   this.setData({
  //     width: 55
  //   });
  //   qqmapsdk.search({
  //     keyword: e.detail.value,
  //     success: function (res) {
  //       console.log(res);
  //     }
  //   })
  // },
  // searchChange(e) {
  //   console.log(e);
  // },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    var that = this;
    this.setData({
      inputVal: e.detail.value
    });
    qqmapsdk.getSuggestion({
      keyword: e.detail.value,
      success: function (res) {
        console.log(res);
        that.setData({
          searchResults: res.data
        });
      }
    });
  },
  click: function (e) {
    console.log(e.currentTarget.id);
    var str = e.currentTarget.id;
    var ss = str.split("-");
    console.log(ss[0]);
    console.log(ss[1]);
    this.setData({
      myLat: ss[0],
      myLng: ss[1],
      inputVal: "",
      inputShowed: false
    });
    var that = this;
    wx.request({
      url: "http://127.0.0.1:9000/markers",
      data: {
        //加入scale参数
        // scale: that.data.scale,
        lat: ss[0],
        lng: ss[1]
      },
      success: function (res) {
        console.log(res.data.markers);
        var ms = [];
        for (var i = 0; i < res.data.markers.length; i++) {
          var m = res.data.markers[i];
          var s = {};
          s["latitude"] = m.lat;
          s["longitude"] = m.lng;
          s["id"] = i;
          s["iconPath"] = "/resources/marker.png";
          s["width"] = 48;
          s["height"] = 46;
          s["showName"] = m.show_name;
          s["intro"] = m.intro;
          s["phone"] = m.phone;
          ms[i] = s;
        }
        that.setData({
          markers: ms
        });
      }
    });
  }
});
