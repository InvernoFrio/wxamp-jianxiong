// data/music-config.js
// 将云存储 fileID 填到 url 字段即可启用对应页面音乐。

const musicConfig = {
  reader: {
    id: 'reader-liangzhu',
    title: '梁祝',
    url: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/梁祝.mp3'
  },
  timeline: {
    id: 'timeline-molihua-piano',
    title: '茉莉花钢琴版',
    url: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/李昀昊 - 茉莉花（钢琴版）.flac'
  },
  team: {
    zhangjunxian: {
      id: 'team-zjx',
      title: '张俊贤主题音乐',
      url: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/春日影 (MyGO!!!!! ver.) - MyGO!!!!!.mp3',
      backgroundUrl: ''
    },
    huangliangzhe: {
      id: 'team-hlz',
      title: '黄亮哲主题音乐',
      url: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/↑THE HIGH-LOWS↓ - 胸がドキドキ.mp3',
      backgroundUrl: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/08f87bf491d37fbf5ae1352627ddeffd.jpeg'
    },
    chenzhongyu: {
      id: 'team-czy',
      title: '陈钟宇主题音乐',
      url: '',
      backgroundUrl: ''
    },
    yangjiayuan: {
      id: 'team-yjy',
      title: '杨佳园主题音乐',
      url: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/群青 - YOASOBI.mp3',
      backgroundUrl: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/1d4e7f2fe29b044473217ae69154119c.jpg'
    },
    hetianzhuang: {
      id: 'team-htz',
      title: '贺天壮主题音乐',
      url: '',
      backgroundUrl: ''
    }
  }
};

module.exports = musicConfig;
