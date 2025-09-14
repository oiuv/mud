# SocketClient 通用Socket客户端

基于 FluffOS 的通用 socket 客户端模块，支持 TCP/UDP 协议的数据通讯。

## 功能特性

- **协议支持**: TCP 和 UDP
- **异步非阻塞**: 基于 FluffOS socket API
- **DNS缓存**: 自动缓存DNS解析结果
- **连接管理**: 完整的连接状态管理
- **服务器模式**: 支持TCP/UDP服务器监听
- **调试模式**: 详细的调试日志输出

## 文件结构

```
inherit/Socket.c        # 核心Socket工具库
cmds/test/socket.c      # 游戏内测试命令
docs/socket.md          # 本文档
```

## 快速开始

### 1. 继承工具库

```lpc
inherit "/inherit/Socket";
```

### 2. 重写回调函数

```lpc
// 连接成功回调
protected void on_connect(int fd) {
    write("连接 " + fd + " 已建立\n");
    send_data(fd, "Hello Server!\n");
}

// 接收数据回调
protected void on_receive(int fd, mixed data) {
    write("收到数据: " + data + "\n");
}

// 连接关闭回调
protected void on_close(int fd) {
    write("连接 " + fd + " 已关闭\n");
}
```

### 3. 建立连接

```lpc
// TCP连接
int tcp_fd = tcp_connect("127.0.0.1", 8080);

// UDP连接
int udp_fd = udp_connect("8.8.8.8", 53);
```

### 4. 发送数据

```lpc
send_data(tcp_fd, "Hello TCP!");
send_data(udp_fd, "Hello UDP!");
```

## API 参考

### 连接管理

- `tcp_connect(string host, int port)` - 创建TCP连接
- `udp_connect(string host, int port)` - 创建UDP连接
- `close(int fd)` - 关闭连接
- `is_connected(int fd)` - 检查连接状态

### 数据传输

- `send_data(int fd, mixed data)` - 发送数据
- `sendto(int fd, string data, string host, int port)` - UDP发送数据到指定地址

### 服务器功能

- `tcp_listen(int port, string addr)` - 启动TCP服务器
- `udp_listen(int port, string addr)` - 启动UDP服务器

### 调试和监控

- `set_debug(int flag)` - 设置调试模式
- `get_connections()` - 获取所有连接信息
- `get_info(int fd)` - 获取指定连接信息

## 游戏内命令使用

### 基本命令

```bash
# 建立TCP连接
socket tcp tcpbin.com 4242

# 建立UDP连接
socket udp udpbin.com 4242

# 启动TCP服务器
socket server tcp 8888

# 发送数据到连接3
socket send 3 hello world

# 查看所有连接
socket list

# 关闭连接3
socket close 3

# 显示帮助
socket help
```

### 使用示例

```bash
# 在游戏内测试TCP连接
socket tcp tcpbin.com 4242

# 发送测试数据
socket send 1 "Hello from MUD!"

# 查看连接状态
socket list

# 启动本地TCP服务器
socket server tcp 8888
```

## 代码示例

### 基本TCP客户端

```lpc
// 继承Socket工具库
inherit "/inherit/Socket";

void create() {
    set_debug(1);  // 开启调试
    int fd = tcp_connect("127.0.0.1", 8080);
}

protected void on_receive(int fd, mixed data) {
    write("收到数据: " + data + "\n");
}
```

### UDP客户端

```lpc
inherit "/inherit/Socket";

void create() {
    set_debug(1);
    int fd = udp_connect("8.8.8.8", 53);
    send_data(fd, "DNS Query");
}
```

### TCP服务器

```lpc
inherit "/inherit/Socket";

void create() {
    set_debug(1);
    tcp_listen(8888, "0.0.0.0");
}

protected void on_connect(int fd) {
    write("新客户端连接: " + fd + "\n");
    send_data(fd, "Welcome to MUD Server!\n");
}
```

## 基本用法

```lpc
// 继承Socket工具库
inherit "/inherit/Socket";

// 建立TCP连接
int fd = tcp_connect("127.0.0.1", 8080);

// 发送数据
send_data(fd, "test data");

// 关闭连接
close(fd);
```

## 注意事项

1. **权限要求**: 游戏内命令需要管理员权限
2. **连接句柄**: 所有操作使用返回的整数句柄
3. **异步操作**: 网络操作是异步的，使用回调函数处理结果
4. **错误处理**: 检查返回值处理连接错误
5. **资源管理**: 及时关闭不再使用的连接
6. **玩家关联**: 游戏内命令会自动关联连接和玩家对象

## 调试技巧

- 开启调试模式：`set_debug(1)`
- 查看调试日志：检查 `/log/debug.log`
- 使用 `socket list` 查看连接状态
- 使用 `socket help` 获取帮助信息

## 扩展功能

可以继承 `SocketClient` 实现特定协议：

- HTTP客户端
- Telnet客户端
- 游戏协议客户端
- 自定义二进制协议

通过重写回调函数实现自定义逻辑，所有网络底层细节由 `SocketClient` 处理。