/*
 * @Author: Claude Code
 * @Date: 2025-08-24
 * @Description: 通用Socket工具库
 * 支持TCP/UDP协议的数据通讯
 */

#include <socket.h>
#include <socket_err.h>

#define STATE_CLOSED 0
#define STATE_CONNECTING 1
#define STATE_CONNECTED 2
#define STATE_LISTENING 3

nosave mapping Connections = ([]);
nosave mapping DNSCache = ([]);
nosave int Debug;

// 函数声明 - LPC要求使用前必须声明
protected void real_connect(int fd);
protected void cleanup_connection(int fd);
protected void on_receive(int fd, mixed data);
protected void on_close(int fd);
protected void on_connect(int fd);
protected void on_resolve(string host, string addr, int key);
protected void accept_callback(int fd);
protected void receive_data(int fd, mixed data);
protected void connected(int fd);
protected void close_callback(int fd);
protected void receive_callback(int fd, mixed *data...);

// 调试开关
void set_debug(int flag) {
    Debug = flag;
}

// 内部调试输出
protected void debug(string msg) {
    if (Debug) {
        debug_message("[Socket] " + msg);
    }
}

// 清理连接资源
protected void cleanup_connection(int fd) {
    if (Connections[fd]) {
        socket_close(fd);
        map_delete(Connections, fd);
        debug("Connection " + fd + " cleaned up");
    }
}

// 数据接收回调 - 需要被继承类重写
protected void on_receive(int fd, mixed data) {
    debug("Received from " + fd + ": " + data);
}

// 连接关闭回调 - 需要被继承类重写
protected void on_close(int fd) {
    debug("Connection " + fd + " closed");
    cleanup_connection(fd);
}

// 连接成功回调
protected void on_connect(int fd) {
    debug("Connection " + fd + " established");
    if (Connections[fd]) {
        Connections[fd]["state"] = STATE_CONNECTED;
    }
}

// 实际建立连接
protected void real_connect(int fd) {
    mapping conn = Connections[fd];
    string addr;
    int port, type, result;
    
    if (!conn) return;
    
    addr = conn["addr"];
    port = conn["port"];
    type = conn["type"];
    
    if (type == STREAM) {
        result = socket_connect(fd, addr + " " + port, "receive_data", "connected");
    } else {
        result = socket_connect(fd, addr + " " + port, "receive_data", 0);
    }
    
    if (result != EESUCCESS) {
        debug("Connect failed: " + socket_error(result));
        cleanup_connection(fd);
    }
}

// DNS解析回调
protected void on_resolve(string host, string addr, int key) {
    debug("DNS resolved: " + host + " -> " + addr);
    if (addr) {
        DNSCache[host] = addr;
        
        // 处理等待该解析的连接
        foreach (int fd, mapping conn in Connections) {
            if (conn["host"] == host && conn["state"] == STATE_CONNECTING) {
                conn["addr"] = addr;
                real_connect(fd);
            }
        }
    } else {
        // 解析失败，关闭相关连接
        foreach (int fd, mapping conn in Connections) {
            if (conn["host"] == host && conn["state"] == STATE_CONNECTING) {
                cleanup_connection(fd);
            }
        }
    }
}

// 创建TCP连接
public int tcp_connect(string host, int port) {
    int fd = socket_create(STREAM, "receive_callback", "close_callback");
    if (fd < 0) {
        debug("Failed to create TCP socket");
        return -1;
    }
    
    Connections[fd] = ([
        "type": STREAM,
        "host": host,
        "port": port,
        "state": STATE_CONNECTING,
        "protocol": "TCP"
    ]);
    
    if (DNSCache[host]) {
        Connections[fd]["addr"] = DNSCache[host];
        real_connect(fd);
    } else {
        resolve(host, "on_resolve");
    }
    
    debug("TCP connection " + fd + " created for " + host + ":" + port);
    return fd;
}

// 创建UDP连接
public int udp_connect(string host, int port) {
    int fd = socket_create(DATAGRAM, "receive_callback", "close_callback");
    if (fd < 0) {
        debug("Failed to create UDP socket");
        return -1;
    }
    
    Connections[fd] = ([
        "type": DATAGRAM,
        "host": host,
        "port": port,
        "state": STATE_CONNECTING,
        "protocol": "UDP"
    ]);
    
    if (DNSCache[host]) {
        Connections[fd]["addr"] = DNSCache[host];
        real_connect(fd);
    } else {
        resolve(host, "on_resolve");
    }
    
    debug("UDP connection " + fd + " created for " + host + ":" + port);
    return fd;
}

// 发送数据
public int send_data(int fd, mixed data) {
    int result;
    
    if (!Connections[fd]) {
        debug("Invalid connection: " + fd);
        return -1;
    }
    
    if (Connections[fd]["state"] != STATE_CONNECTED) {
        debug("Connection not ready: " + fd);
        return -1;
    }
    
    result = socket_write(fd, data);
    if (result != EESUCCESS) {
        debug("Send failed: " + socket_error(result));
        return -1;
    }
    
    debug("Data sent to " + fd + ": " + sizeof(data) + " bytes");
    return sizeof(data);
}

// 关闭连接
public void close(int fd) {
    cleanup_connection(fd);
}

// 获取连接状态
public int get_state(int fd) {
    return Connections[fd] ? Connections[fd]["state"] : STATE_CLOSED;
}

// 获取连接信息
public mapping get_info(int fd) {
    return Connections[fd] || ([]);
}

// 获取所有连接
public mapping get_connections() {
    return copy(Connections);
}

// 检查连接是否活跃
public int is_connected(int fd) {
    return Connections[fd] && Connections[fd]["state"] == STATE_CONNECTED;
}

// 创建TCP服务器监听
public int tcp_listen(int port, string addr) {
    int fd, result;
    
    fd = socket_create(STREAM, "receive_callback", "close_callback");
    if (fd < 0) {
        debug("Failed to create TCP server socket");
        return -1;
    }
    
    result = socket_bind(fd, port);
    if (result != EESUCCESS) {
        debug("Bind failed: " + socket_error(result));
        socket_close(fd);
        return -1;
    }
    
    result = socket_listen(fd, "accept_callback");
    if (result != EESUCCESS) {
        debug("Listen failed: " + socket_error(result));
        socket_close(fd);
        return -1;
    }
    
    Connections[fd] = ([
        "type": STREAM,
        "state": STATE_LISTENING,
        "port": port,
        "protocol": "TCP_SERVER"
    ]);
    
    debug("TCP server listening on " + (addr || "0.0.0.0") + ":" + port);
    return fd;
}

// 创建UDP服务器
public int udp_listen(int port, string addr) {
    int fd, result;
    
    fd = socket_create(DATAGRAM, "receive_callback", "close_callback");
    if (fd < 0) {
        debug("Failed to create UDP server socket");
        return -1;
    }
    
    result = socket_bind(fd, port);
    if (result != EESUCCESS) {
        debug("Bind failed: " + socket_error(result));
        socket_close(fd);
        return -1;
    }
    
    Connections[fd] = ([
        "type": DATAGRAM,
        "state": STATE_LISTENING,
        "port": port,
        "protocol": "UDP_SERVER"
    ]);
    
    debug("UDP server listening on " + (addr || "0.0.0.0") + ":" + port);
    return fd;
}

// 发送UDP数据到指定地址
public int sendto(int fd, string data, string host, int port) {
    string addr;
    int result;
    
    if (!Connections[fd] || Connections[fd]["type"] != DATAGRAM) {
        debug("Invalid UDP socket: " + fd);
        return -1;
    }
    
    addr = DNSCache[host] || host;
    result = socket_write(fd, data, addr + " " + port);
    if (result != EESUCCESS) {
        debug("UDP send failed: " + socket_error(result));
        return -1;
    }
    
    debug("UDP data sent to " + host + ":" + port + " from " + fd);
    return sizeof(data);
}

// 广播数据到所有连接
public void broadcast(mixed data) {
    foreach (int fd, mapping conn in Connections) {
        if (conn["state"] == STATE_CONNECTED) {
            send_data(fd, data);
        }
    }
}

// Socket事件回调
protected void receive_callback(int fd, mixed *data...) {
    debug("Socket event: " + fd + " -> " + sprintf("%O", data));
}

protected void receive_data(int fd, mixed data) {
    on_receive(fd, data);
}

protected void connected(int fd) {
    on_connect(fd);
}

protected void close_callback(int fd) {
    on_close(fd);
}

protected void accept_callback(int fd) {
    int new_fd = socket_accept(fd, "receive_data", "connected");
    if (new_fd < 0) {
        debug("Accept failed");
        return;
    }
    
    Connections[new_fd] = ([
        "type": STREAM,
        "state": STATE_CONNECTED,
        "protocol": "TCP_CLIENT",
        "server_fd": fd
    ]);
    
    debug("New TCP connection accepted: " + new_fd);
    on_connect(new_fd);
}