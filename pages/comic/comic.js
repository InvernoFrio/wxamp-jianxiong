// pages/comic/comic.js
Page({
  data: {
    comicGroups: [
      {
        id: 1,
        title: "《午后的一束光》",
        date: "2024.04.12",
        images: [
          "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=600",
          "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
          "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600"
        ]
      },
      {
        id: 2,
        title: "《雨夜的街道》",
        date: "2024.03.22",
        images: [
          "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600",
          "https://images.unsplash.com/photo-1527605151189-9116288e9970?w=600",
          "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600",
          "https://images.unsplash.com/photo-1501183638710-841dd1904538?w=600"
        ]
      }
    ]
  },

  previewImage(e) {
    const { current, urls } = e.currentTarget.dataset;
    wx.previewImage({
      current: current,
      urls: urls
    });
  }
})
