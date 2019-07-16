# CekongMap

## 简介
基于mapbox的地图工具，包含：
1. 绘图：点、线、多边形、圆形、扇形；保存、修改、载入、测量
1. 样式切换：提供一个样式切换按钮，切换不同样式
1. 坐标显示：显示鼠标所在位置的经纬度坐标

## 用法
在页面中引用cekongmap.bundle.js
```javascript
  var stylelist = [
    {
      title: '卫星',
      uri: "http://localhost:8080/styles/satellite/style.json"
    },
    {
      title: '矢量',
      uri: "http://localhost:8080/styles/jsb3s-liberty/style.json"
    },
  ];
  map = CekongMap.Create('map', defaultStyle, styleList);
```

其中：defaultStyle是默认地图样式；styleList是用于样式切换的列表；返回值为mapbox-gl的map对象

## 定制
在`/src/index.js`中默认添加了ScaleControl、FullscreenControl、NavigationControl三个mapbox自带控件，同时启用了绘图、样式切换、坐标显示控件，可以根据需求自行修改。

运行npm install安装依赖包，之后运行npm run build打包js文件

## 截图
![avatar](./screenshot-1.png)
![avatar](./screenshot-2.png)

