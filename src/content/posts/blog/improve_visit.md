---
title: 博客访问速度优化
date: 2024-05-05
summary: 排查速度慢的原因 & 提升 Vercel 服务器访问速度
category: 博客
tags: [博客, 性能优化, Vercel]
---

## 以 Vercel 服务器为例

排查思路基本差不多, 根据测试指标做出相应的优化方案。

## 测试

### 国内访问测试

通过站长之家测试各个地区的访问时间

![img_0505163644](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505163644.webp)

<br/>

可以看出测试结果非常差, 之前测试都在几百 ms 左右。 推测是用户数增多, 服务器负载过大等

![img_0505163725](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505163725.webp)

<br/>

### 本地测试

![img_0505170724](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505170724.webp)

例如: 27.9K 的 css, 多次测试, 网络下载至少要花 3.975 秒, 太夸张了~

![img_0505164525](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505164525.webp)

## 原因

通过上面的测试结果发现明显是网络的问题, 但网络问题也存在多样化。
浏览器网络传输是通过 HTTP 协议传输, 现代网站基本都用上了 HTTPS, 所以我们主要分析 HTTPS

一次完整、无缓存、未复用连接的 HTTPS 请求, 主要有以下几个阶段:
DNS 域名解析、TCP 握手、SSL 握手、服务器处理、内容传输等

通过 `curl` 可以快速测试相应的时间, 每次测试结果都不一样, 可以测试多次取平均值

```ts
curl -w '\n time_namelookup=%{time_namelookup}\n time_connect=%{time_connect}\n time_appconnect=%{time_appconnect}\n time_redirect=%{time_redirect}\n time_pretransfer=%{time_pretransfer}\n time_starttransfer=%{time_starttransfer}\n time_total=%{time_total}\n' -o /dev/null -s 'https://full-books.itangqiao.top/'

// 国内深圳访问, 测试结果
 time_namelookup=0.002122
 time_connect=1.181755
 time_appconnect=1.369774
 // time_redirect=0.000000
 time_pretransfer=1.370038
 time_starttransfer=1.560596
 time_total=1.561266

// 用魔法通过香港服务器访问, 相差巨大。 大约 17 倍
time_namelookup=0.002915
time_connect=0.003485
time_appconnect=0.061357
time_redirect=0.000000
time_pretransfer=0.061488
time_starttransfer=0.089909
time_total=0.091384
```

这些指标分别表示

- time_namelookup：DNS 解析时间
- time_connect：TCP 连接时间
- time_appconnect：SSL/TSL 握手时间
- time_pretransfer：请求前的所有步骤时间(发送第一个 GET/POST 请求之前的耗时)
- time_starttransfer：从发送请求到收到第一个字节的时间
- time_total：总时间

通过百分比量化结果

1. DNS 解析时间 (time_namelookup) 占总时间的百分比：约为 0.14%
2. 连接建立时间 (time_connect) 占总时间的百分比：约为 75.69%
3. SSL 握手时间 (time_appconnect) 占总时间的百分比：约为 87.71%
4. 请求到达前的总时间 (time_pretransfer) 占总时间的百分比：约为 87.74%
5. 开始传输时间 (time_starttransfer) 占总时间的百分比：约为 99.96%

从测试结果可以看出 DNS 解析没有问题, vercel 去年被墙了, 之后使用了 vercel 为中国开放 DNS 解析服务器 `CNAME: cname-china.vercel-dns.com`。DNS 服务主要是用来帮我们找到相应的服务器, 虽然可以找到, 但是服务器太远了, 基本都在美国加州, 并没有为我们优选服务器。

通过"炸了么"的测试结果可以直接看见服务器的位置, 都在美国, 很有可能是慢的主要原因。

![img_0505181451](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505181451.webp)

其实 vercel 服务器也不少, 离我们最近的服务器有 台湾、香港、日本等。

```ts
34.95.57.145 [加拿大 魁北克省蒙特利尔 Google 云计算数据中心]
13.49.54.242 [瑞典 斯德哥尔摩 Amazon 数据中心]
18.178.194.147 [日本 东京都东京 Amazon 数据中心]
52.79.72.148 [韩国 首尔 Amazon 数据中心]
35.180.16.12 [法国 巴黎 Amazon 数据中心]
18.206.69.11 [美国 弗吉尼亚州阿什本 Amazon 数据中心]
52.76.85.65 [新加坡 Amazon 数据中心]
18.130.52.74 [英国 伦敦 Amazon 数据中心]
35.202.100.12 [美国 Merit 网络公司]
35.195.188.93 [比利时 瓦隆大区圣吉斯兰 Google 云计算数据中心]
3.22.103.24 [美国 Amazon EC2 服务器]
34.253.160.225 [爱尔兰 都柏林 Amazon 数据中心]
18.229.231.184 [巴西]
15.206.54.182 [美国 惠普 HP]
35.235.101.253 [美国 加利福尼亚州洛杉矶 Google 云计算数据中心]
35.196.196.42 [美国 Merit 网络公司]
35.228.53.122 [美国 俄勒冈州达尔斯 Google 云计算数据中心]
34.65.228.161 [美国 得克萨斯州]
52.38.79.87 [美国 俄勒冈州波特兰 Amazon 数据中心]
13.238.105.1 [澳大利亚 新南威尔士州悉尼 Amazon 数据中心]
104.199.217.228 [台湾省彰化县 Google 云计算数据中心]
52.9.164.177 [美国 加利福尼亚州旧金山 Amazon 数据中心]
18.162.37.140 [香港 Amazon 数据中心]
```

那我们解析到最近的服务器不就行了?

当然没有这么简单, 因为国内使用 vercel 的用户越来越多了, 这几个服务器有的时候根本吃不消, 有的时候香港负载过大, 有的时候台湾负载过大 等等。 所以能不能搞一个负载均衡延迟测试? 看哪里的负载小就连接哪个地方/哪台服务器。 有的同学已经走在前面了! 我们可以直接使用。

## 优化

最后使用了 **Fgaoxing** 同学搭建的优选 IP 服务, 根据不同的地理位置和不同的运营商, 分别找到最优的服务器。

<img src="https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505182123.webp" alt="img_0505182123" style="zoom:50%;" />

### 优化前

`CNAME: cname-china.vercel-dns.com`, 找到的服务器全部在美国

![img_0505184855](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505184855.webp)

### 优化后

`CNAME: vercel.cdn.yt-blog.top`, 优选最近的服务器, 这 11 台服务器分布在不同的地点

![img_0505184734](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505184734.webp)

#### 国内访问测试结果

摘取各个地区和各个运营商部分测试结果, 可以看见基本都连接到了 台湾、香港、新加坡等

![image-20240505201720727](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/image-20240505201720727.webp)

![img_0505185509](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505185509.webp)

![img_0505185422](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505185422.webp)

#### 本地测试结果

![img_0505190441](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0505190441.webp)

#### curl 测试结果

~~1.561266(before)~~ → 0.172446 (now)

```ts
time_namelookup = 0.00484
time_connect = 0.006334
time_appconnect = 0.100314
time_redirect = 0.0
time_pretransfer = 0.10041
time_starttransfer = 0.170613
time_total = 0.172446
```

### Google PageSpeed Insights 报告

![image.png](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/202405121623768.webp)

![image.png](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/202405121624651.webp)

## 心得

vercel 免费服务也不知道持续到多久，免费的往往也是最贵的, 时间成本永远无法估量。有条件的同学还是推荐自己买云服务器和 CDN 服务~ 我的云服务器马上就到期了，暂时不续了，目前 vercel 也够用。

喜欢折腾的同学可以试试，希望这篇文章有帮助到你。

## 参考

书籍: 深入架构原理与实践  
博客: Fgaoxing
