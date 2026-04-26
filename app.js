// app.js - 健雄书韵 小程序入口
App({
  onLaunch() {
    console.log('健雄书韵 - 吴健雄数字纪念馆 启动');
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'cloud1-d1g022q9nafce6169', // 云环境 ID
        traceUser: true,
      });
    }
  },
  globalData: {
    theme: {
      paper: '#F5F0E8',
      ink: '#2C2C2C',
      vermilion: '#C41E3A',
      blueGrey: '#8B9DAF',
      amber: '#D4A574'
    }
  }
});

