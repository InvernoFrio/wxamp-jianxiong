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
      backgroundUrl: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/background/hlz.jpeg'
    },
    chenzhongyu: {
      id: 'team-czy',
      title: '陈钟宇主题音乐',
      url: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/三澤秋 - For Your Pieces feat. 三澤秋.mp3',
      backgroundUrl: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/background/czy.jpg'
    },
    yangjiayuan: {
      id: 'team-yjy',
      title: '杨佳园主题音乐',
      url: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/music/群青 - YOASOBI.mp3',
      backgroundUrl: 'cloud://cloud1-d1g022q9nafce6169.636c-cloud1-d1g022q9nafce6169-1426049260/background/yjy.jpg'
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
