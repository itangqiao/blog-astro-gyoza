---
title: 手写 vite-server 编译 SFC 文件
description: 模拟 vite 代理服务器编译 .vue 文件
poster:
  topic: null
  headline: 手写 vite-server 编译 SFC 文件
  caption: 模拟 vite 代理服务器编译 .vue 文件
  color: 1B1C20
categories:
  - web
tags:
  - web
  - 前端
  - vite
abbrlink: a6235430
date: 2024-05-24
---

---

## 概览

主要功能

- 静态 Web 服务器
- 第三方模块加载
- SFC 文件编译

## 准备

服务端初始化

```ts
// 创建文件夹, 初始化,
mkdir vite-cli
pnpm init
mkdir src
touch src/index.js
```

安装依赖

```ts
// 使用 koa 框架和 koa-send 中间件
pnpm i koa koa-send
```

server 目录结构

```ts
├── node_modules
│   ├── koa -> .pnpm/koa@2.15.3/node_modules/koa
│   └── koa-send -> .pnpm/koa-send@5.0.1/node_modules/koa-send
├── package.json
├── pnpm-lock.yaml
└── src
    └── index.js
```

client 目录结构

```ts
// 搭建一个vue项目, 用于测试 vite-cli 脚手架
├── index.html
├── index.js
├── node_modules
│   ├── @vue
│   │   ├── reactivity -> ../.pnpm/@vue+reactivity@3.4.27/node_modules/@vue/reactivity
│   │   ├── runtime-core -> ../.pnpm/@vue+runtime-core@3.4.27/node_modules/@vue/runtime-core
│   │   ├── runtime-dom -> ../.pnpm/@vue+runtime-dom@3.4.27/node_modules/@vue/runtime-dom
│   │   └── shared -> ../.pnpm/@vue+shared@3.4.27/node_modules/@vue/shared
│   └── vue -> .pnpm/vue@3.4.27/node_modules/vue
├── package.json
├── pnpm-lock.yaml
└── src
    ├── App.vue
    ├── main.js
    └── views
        └── ChildCom.vue
```

## 开始搭建静态 Web 服务器

我们搭建的 `vue-cli` 是基于 `Node` 的命令行工具, 指定 `Node` 环境的安装位置

```ts
// server/src/index.js
#!/usr/bin/env node
const koa = require('koa');
const send = require('koa-send');

// 1. 开启静态服务器
app.use(async (ctx, next) => {
  await send(ctx, ctx.path, { root: process.cwd(), index: 'index.html' });
  await next();
})

app.listen(3000);
console.log('服务已运行在 localhost:3000');
```

```ts
// package.json
{
  ...
  "bin": "src/index.js"
}
```

测试

```ts
// 如果出现错误, 说明该文件没有执行权限
╰─ node src/index.js
 ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command failed with EACCES: src/index.js
SFCwn src/index.js EACCES
```

设置执行权限

```sh
chmod +x src/index.js
```

使用 `pnpm link` 链接到全局, 可以在全局使用 `vite-cli` 会在打开的路径开启一个静态服务器

```sh
╰─ pnpm link --global
Progress: resolved 17, reused 17, downloaded 0, added 0, done
 WARN  link:/Users/Tony/Sync/Code/Nodejs/Vite/vite-cli/server has no binaries

/Users/Tony/Library/pnpm/global/5:
+ vite-cli 1.0.0 <- ../../../../Sync/Code/Nodejs/Vite/vite-cli/server
```

已生成 `vite-cli` 命令行

![img_0523215843](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0523215843.webp)

### 客户端测试

在 `client` 目录下使用 `vite-cli` 会开启一个静态服务器

打开服务器地址, 页面显示正常

```html
// client/index.html ...
<body>
  HelloWorld
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
```

![img_0523213306.webp](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0523213306.webp)

控制台报错是正常情况

![img_0523213217.webp](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0523213217.webp)

浏览器无法识别从 `node_modules` 导入的第三方模块, 而默认路径都包含 `"/"` , 浏览器没识别到, 所以抛出了异常

```ts
// 直接导入的方式, 无法被直接识别
import { createApp } from 'vue'

// 原本的 vite 会将我们导包的方式改写为下面这种方式
import { createApp } from '/@modules/vue.js'

// 浏览器引入的时候, 请求 vue.js 会是这样
http://localhost:3000/@modules/vue.js
```

## 浏览器加载第三方模块

### 修改第三方模块引入路径

```ts
/**
* @description: 数据流转字符串
* @param {type} Stream
* @return: String
*/
const streamToString = (stream, encoding = 'uft-8') => new Promise((resolve, reject) => {
  const chunks = [];
  stream.on('data', chunk => chunks.push(chunk));
  stream.on('end', () => resolve(Buffer.concat(chunks).toString(encoding)));
  stream.on('error', error => reject(error));
})

// 1. 开启静态服务器
...

// 2. 修改第三方模块地址
app.use(async (ctx, next) => {
  if (ctx.type === 'application/javascript') {
    const content = await streamToString(ctx.body); // ctx.body是一个数据流,需要将其转换为toString

    // 目的: 将 import { xxx } from 'xxx' 转为 ->  import { xxx } from '/@modules/xxx';
    // 正则拆解: 分 2 组, 1组提取 'from空格', 2组 排除 './'; 最后 将1组 替换为 '/@modules/'
    ctx.body = content.
      replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/') // @modules 只是一个占位符, 用于标记, 无实际意义
  }
  await next();
})
```

启动后发现路径引入路径已经发生了变化, 但是还找不到模块引入的真实路径

![img_0523230810.webp](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0523230810.webp)

### 加载第三方模块

```ts
const path = require('path');
...

// 3. 加载第三方模块, 放在服务器开启之前处理
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/@modules/')) {
    const moduleName = ctx.path.slice(10); // '/@modules/' 之后开始截取
    const pkgPath = path.join(process.cwd(), 'node_modules', moduleName, 'package.json'); // 绝对路径拼接
    const pkg = require(pkgPath); // 导入真实的模块

    // 指向更改, 例如: 将 /@modules/vue 替换为
    //    ->  绝对路径/node_modules/vue/package.json/中 "module": "dist/vue.runtime.esm-bundler.js",
    // import vue from 'vue' 是通过 node_modules/vue/package.json -> module 引入的
    ctx.path = path.join('/node_modules', moduleName, pkg.module);
  }
  await next();
})

// 1. 开启静态服务器
// 2. 修改第三方模块地址
```

模块加载成功

![img_0524010258.webp](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0524010258.webp)

可以看见无法识别 `SFC`, 需要编译 `template` 模板

![img_0524011714.webp](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0524011714.webp)

响应体格式是一个字节流, 浏览器无法处理, 默认只会下载, 还需要将 `SFC` 文件编译后, 将格式类型设置为 `'application/javascript'`

![img_0524011847.webp](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0524011847.webp)

### 模板编译

```ts
// pnpm i @vue/compiler-sfc 安装官方的 sfc 模板编译模块
// "@vue/compiler-sfc": "^3.4.27"

const compilerSFC = require('@vue/compiler-sfc');
const { Readable } = require('stream');
...

/**
* @description: 字符串转数据流
* @param {type} String
* @return: Stream
*/
const stringToStream = (text) => {
  const stream = new Readable();
  stream.push(text);
  stream.push(null); // 传null,表示当前流写入完成
  return stream;
}

// 3. 加载第三方模块
// 1. 开启静态服务器

// 4. 处理 SFC 单文件组件
app.use(async (ctx, next) => {
  // 匹配.vue文件
  // 数据流处理
  // 使用Vue官方模块对 SFC 进行编译
  // 将编译后的结果重新拼装回去,并改变响应体的类型
  if (ctx.path.endsWith('.vue')) {
    const content = await streamToString(ctx.body);
    const { descriptor } = compilerSFC.parse(content);

    let code;

    // app.vue 第1次请求: 将单文件组件中的脚本和模板部分动态地组合成一个完整的 Vue
    if (!ctx.query.type) {
      console.log(ctx.query.type);
      // console.log(descriptor);
      code = descriptor.script.content;
      code = code.replace(/export\s+default\s+/g, 'const _script = ');
      code += `
        import { render as _render } from '${ctx.path}?type=template';
        _script.render = _render;
        export default _script;
      `
    }
    // app.vue 第2次请求: 编译渲染模板
    else if (ctx.query.type === 'template') {
      const templateRender = compilerSFC.compileTemplate({ source: descriptor.template.content });
      code = templateRender.code;
    }
    ctx.type = 'application/javascript';
    ctx.body = stringToStream(code);
  }
  await next();
})

// 2. 修改第三方模块地址
```

模板已经渲染, 浏览器没有 `process` , 被阻断了; 就差这一步

![img_0524025236.webp](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0524025236.webp)

```ts
// 控制台错误
const EMPTY_OBJ = !!(process.env.NODE_ENV !== 'production') ? Object.freeze({}) : {}
```

将判断是否生产环境这段逻辑, 直接替换为开发环境 `"development" !== "production"`

```ts
// 2. 修改第三方模块地址
...
ctx.body = content.
	replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/').
+   replace(/process\.env\.NODE_ENV/g, '"development"')
```

### 测试

成功编译并加载 `SFC` 文件, 完成!

![img_0524032700.webp](https://gcore.jsdelivr.net/gh/itangqiao/pic@main/blog/img_0524032700.webp)

## 完整代码

服务端

```ts
// server/src/index.js
#!/usr/bin/env node

const koa = require('koa');
const send = require('koa-send');
const path = require('path');
const compilerSFC = require('@vue/compiler-sfc');
const { Readable } = require('stream');

const app = new koa();

/**
* @description: 数据流转字符串
* @param {type} Stream
* @return: String
*/
const streamToString = (stream, encoding = 'utf-8') => new Promise((resolve, reject) => {
  const chunks = [];
  stream.on('data', chunk => chunks.push(chunk));
  stream.on('end', () => resolve(Buffer.concat(chunks).toString(encoding)));
  stream.on('error', error => reject(error));
})

/**
* @description: 字符串转数据流
* @param {type} String
* @return: Stream
*/
const stringToStream = (text) => {
  const stream = new Readable();
  stream.push(text);
  stream.push(null); // 传null,表示当前流写入完成
  return stream;
}

// 3. 加载第三方模块
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/@modules/')) {
    const moduleName = ctx.path.slice(10);
    const pkgPath = path.join(process.cwd(), 'node_modules', moduleName, 'package.json');
    const pkg = require(pkgPath);
    console.log(pkg.module);
    // 指向更改, 例如: 将 /@modules/vue 替换为
    //    ->  绝对路径/node_modules/vue/package.json/中 "module": "dist/vue.runtime.esm-bundler.js",
    // import vue from 'vue' 是通过 node_modules/vue/package.json -> module 引入的
    ctx.path = path.join('/node_modules', moduleName, pkg.module);
  }
  await next();
})


// 1. 开启静态服务器
app.use(async (ctx, next) => {
  await send(ctx, ctx.path, { root: process.cwd(), index: 'index.html' });
  await next();
})

// 4. 处理 SFC 单文件组件
app.use(async (ctx, next) => {
  // 匹配.vue文件
  // 数据流处理
  // 使用Vue官方模块对 SFC 进行编译
  // 将编译后的结果重新拼装回去,并改变响应体的类型
  if (ctx.path.endsWith('.vue')) {
    const content = await streamToString(ctx.body);
    const { descriptor } = compilerSFC.parse(content);

    let code;

    // app.vue 第1次请求
    if (!ctx.query.type) {
      console.log(ctx.query.type);
      // console.log(descriptor);
      code = descriptor.script.content;
      code = code.replace(/export\s+default\s+/g, 'const _script = ');
      code += `
        import { render as _render } from '${ctx.path}?type=template';
        _script.render = _render;
        export default _script;
      `
    }
    // app.vue 第2次请求: 编译模板
    else if (ctx.query.type === 'template') {
      const templateRender = compilerSFC.compileTemplate({ source: descriptor.template.content });
      code = templateRender.code;
    }
    ctx.type = 'application/javascript';
    ctx.body = stringToStream(code);
  }
  await next();
})


// 2. 修改第三方模块地址
app.use(async (ctx, next) => {
  if (ctx.type === 'application/javascript') {
    const content = await streamToString(ctx.body); // ctx.body是一个数据流,需要将其转换为toString

    // 目的: 将 import { xxx } from 'xxx' 转为 ->  import { xxx } from '/@modules/xxx';
    // 正则拆解: 分 2 组, 1组提取 'from空格', 2组 排除 './'; 最后 将1组 替换为 '/@modules/'
    ctx.body = content.
      replace(/(from\s+['"])(?![\.\/])/g, '$1/@modules/'). // @modules 只是一个占位符, 用于标记, 无实际意义
      replace(/process\.env\.NODE_ENV/g, '"development"')
  }
  await next();
})



app.listen(3000);
console.log('服务已运行在 localhost:3000');
```

客户端

```ts
// client/src/App.vue
<script>
import ChildCom from "./views/ChildCom.vue";

export default {
  name: 'App',
  components: {
    ChildCom
  }
}
</script>

<template>
  <ChildCom></ChildCom>
</template>
```

```ts
// client/src/views/ChildCom.vue
<script>
export default {
  name: "ChildCom",
  setup(){
    let sayHi = "hello world";
    return {
      sayHi
    };
  }
};

</script>

<template>
  {{ sayHi }}
</template>

```
