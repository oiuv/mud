# Web 客户端

面向日常游戏使用：保留原有连接选项，优先保证连接稳定、中文输入、终端显示和常用交互正确。

## 部署

将整个 `www/` 目录部署到驱动的 `websocket http dir`，包括 `index.html`、`client.js` 和 `vendor/`。无需 npm 安装或构建，也不依赖 CDN。

`vendor/` 原样复制 FluffOS 随附的 xterm.js 与 FitAddon，保留对应许可证。更新时从 `fluffos/src/www/vendor/` 同步并核对文件哈希，不手工修改第三方文件。

## 支持范围

| 功能 | 行为 |
| --- | --- |
| WS / WSS | 保留地址、端口及安全连接选择；TLS 与 WebSocket 压缩由浏览器处理 |
| ASCII | UTF-8 文本输入，兼容文本及二进制输出 |
| Telnet / Binary | 默认使用 Telnet；Binary 保留旧版兼容；处理拆包、IAC 转义、终端类型、字符集及窗口尺寸 |
| HTTP / 无子协议 | HTTP 打开服务器静态网页；“无”不指定子协议，具体行为由服务器决定 |
| 命令输入 | 中文输入法、方向键历史、草稿恢复；Telnet 按服务器 ECHO 自动隐藏密码，密码不进入历史 |
| 即时输入 | FluffOS SGA 自动切换 `get_char()` 输入；按键直接发送，结束后恢复命令栏，无需手动选模式 |
| 终端显示 | xterm.js 处理中文宽度、颜色、光标、擦除及备用屏幕；NAWS 上报真实字符列数和行数 |
| 手机布局 | 适配可见区域与屏幕安全区；键盘展开或横屏时收紧留白 |
| GMCP | 收发客户端、窗口及自定义模块数据；保留最近 100 个模块的数据，不额外添加状态面板 |
| MSP | 保留原有协商和控制台消息记录，目前不播放音频 |
| 连接管理 | 超时处理、空帧保活、最多三次异常重连及主动断开；保留聊天和命令历史，不自动重发输入 |

ASCII 没有 Telnet 的输入状态，继续使用普通文本输入与历史。HTTP 是静态文件服务，不是游戏 WebSocket 会话；FluffOS 的“无子协议”默认入口不保证建立游戏会话。

MSDP、MSSP、ZMP、MXP、NEW-ENVIRON、LINEMODE 等当前不实现，收到请求时正常拒绝协商，不影响普通游戏。它们不作为必须补齐的任务。WebSocket 通道不启用 MCCP，使用浏览器协商的 `permessage-deflate`。

游戏输出交给终端作为文本和终端控制序列处理，不作为 HTML 执行。断线、重连和退出临时交互界面后保留正常屏幕中的记录。

## 验证

从项目根目录运行，建议 Node.js 22+：

```sh
node --check www/client.js
node --test tools/tests/test_web_client.mjs
node tools/tests/test_web_client_browser.mjs
```

协议测试覆盖输入与历史、协商与分片、连接超时、重连、迟到消息、即时输入和窗口上报。浏览器测试使用独立配置及本机测试服务器，验证实际 xterm 渲染、中文输入、安全文本、按键、备用屏幕、手机布局、模拟键盘展开/收起与历史保留；截图输出到系统临时目录。软键盘测试模拟 VisualViewport 变化，仍需在真实手机上检查键盘和浏览器工具栏行为。

浏览器测试自动查找 Chrome/Chromium/Edge，也可用 `CHROME_PATH` 指定可执行文件。它不使用日常浏览器的账号或配置。真实驱动复验已通过 HTTP、ASCII/Telnet/Binary 中文命令往返，以及 `get_char()` 无回车输入和恢复按行输入；不将这些结果等同于所有扩展协议或线上 TLS 环境均已验证。

实现依据：[WebSocket](../fluffos/src/net/websocket.cc)、[Telnet 协商及输入模式](../fluffos/src/net/telnet.cc)、[ASCII 收发](../fluffos/src/net/ws_ascii.cc)、[官方终端组件说明](../fluffos/src/www/README.md)。
