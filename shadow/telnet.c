// telnet.c

#include <net/socket.h>
#include <ansi.h>

inherit F_SHADOW;

STATIC_VAR_TAG string from_user;        // 用户发送来的信息
STATIC_VAR_TAG int fd;                  // 连接远端机器的套接字
STATIC_VAR_TAG string dest_addr;        // 连接远端机器的地址
STATIC_VAR_TAG int port;                // 连接远端机器的端口号

#define MAX_PENDING_INPUT               16384

// 取消所有人物的基本属性

private void send_to_remote();

void init()
{
}

int is_telneting() { return 1; }

string query_dest_addr() { return sprintf("%s %d", dest_addr, port); }

void telnet_input(string str)
{
        if (str == "CLOSE")
        {
                write("用户断开了连接。\n");
                destruct(this_object());
                return;
        }

        input_to("telnet_input");

        if (strlen(str) + strlen(from_user) < MAX_PENDING_INPUT)
        {
                from_user += str + "\n";
                if (find_call_out("send_to_remote") == -1)
                        send_to_remote();
        } else
                write("你输入的太多了...\n");
}

int accept_fight(object ob)
{
        return notify_fail("正在远程登录中...\n");
}

int accept_hit(object ob)
{
        return accept_fight(ob);
}

int accept_kill(object ob)
{
        return accept_fight(ob);
}

int accept_ansuan(object ob)
{
        return accept_fight(ob);
}

int accept_touxi(object ob)
{
        return accept_fight(ob);
}

void receive_damage(string type, int n, object from)
{
        return;
}

void receive_wound(string type, int n, object from)
{
        return;
}

void heart_beat()
{
        set_heart_beat(0);
}

void fight_ob(object ob)
{
        return;
}

void kill_ob(object ob)
{
        return;
}

void unconcious()
{
        return;
}

void die(object killer)
{
        return;
}

int clean_up()
{
        if (query_shadow_now())
                return 0;

        destruct(this_object());
        return 0;
}

void connect_to(string arg)
{
        if (sscanf(arg, "%s %d", dest_addr, port) != 2)
        {
                write("地址错误。\n");
                return;
        }

        write("解析地址中...\n");
        from_user = "";
        resolve(dest_addr, "telnet_resolve_callback");
        input_to("telnet_input");
}

void telnet_resolve_callback(string address, string resolved, int key)
{
        int ret;
        object sob;
        string full_addr;

        if (! objectp(sob = query_shadow_now()))
        {
                destruct(this_object());
                return;
        }

        while (1)
        {
                if (! resolved)
                {
                        message("telnet", "无法解析地址。\n", sob);
                        if (sscanf(dest_addr, "%*d.%*d.%*d.%*d") == 4)
                                resolved = dest_addr;
                        else
                                break;
                }

                full_addr = sprintf("%s %d", resolved, port);
                fd = socket_create(STREAM,
                                   "telnet_read_callback",
                                   "telnet_close_callback" );
                if (fd < 0)
                {
                        message("telnet", "SOCKET 初始化错误。\n", sob);
                        break;
                }
        
                ret = socket_connect(fd, full_addr,
                                     "telnet_read_callback",
                                     "telnet_write_callback");
                if (ret != EESUCCESS)
                {
                        message("telnet", "网络连接错误。\n", sob);
                        break;
                }
        
                message("telnet", "正在连接" + address +
                                  "(" + full_addr + ")...\n", sob);
                return;
        }

        sob->write_prompt();
        destruct(this_object());
}

void telnet_read_callback(int fd, string mess)
{
        object sob;

        if (! objectp(sob = query_shadow_now()))
        {
                destruct(this_object());
                return;
        }

        if (stringp(mess))
                message("telnet", mess, sob);
}

void telnet_write_callback(int fd)
{
        if (strlen(from_user))
                send_to_remote();
}

void telnet_close_callback(int fd)
{
        object sob;

        if (objectp(sob = query_shadow_now()))
                message("telnet", HIR "连接断开了：请按回车键继续..." NOR, sob);

        destruct(this_object());
}

void remove()
{
}

void remove_interactive()
{
        destruct(this_object());
}

varargs string short(int raw)
{
        object sob;
        string str;

        if (objectp(sob = query_shadow_now()))
        {
                str = sob->short(raw);
                str = replace_string(str, " <输入文字中>", " <远程登录中>");
                return str;
        }

        return 0;
}

// 将用户发送来的数据发送到远端服务器上去
private void send_to_remote()
{
        switch (socket_write(fd, from_user))
        {
        case EESUCCESS:
        case EECALLBACK:
                // 发送成功了
                from_user = "";
                return;

        case EEWOULDBLOCK:
                // 发送数据阻塞
                call_out("send_to_remote", 2);
                return;

        default:
                // 发送失败
                return;
        }
}
