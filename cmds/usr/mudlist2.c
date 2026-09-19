// mudlist.c
#include <ansi.h>

#define MODE 2
#define MUD_DNS "118.190.104.241 5567"

nosave int Socket;
nosave mixed *List = ({});

void read_callback(int fd, mixed message, string addr) {
    // debug(sprintf("fd = %d, addr = %s", fd, addr));
    // debug(json_decode(message));
    List += ({ json_decode(message) });
}

private void socket_init() {
    // 创建一个 efun socket 连接
    Socket = socket_create(MODE, "read_callback");
    // 如果不绑定端口，将使用随机端口连接服务器，但无法收到服务端返回的消息
    socket_bind(Socket, 7890);
    if (Socket < 0) {
        cecho("【Warning】socket_create error: " + socket_error(Socket));
    } else {
        int err;
        // UDP 发送消息到服务器
        err = socket_write(Socket, "mudlist", MUD_DNS);
        if (err < 0) {
            cecho("【Warning】socket_write error: " + socket_error(err));
            // socket_close(Socket);
        }
    }
}

void create() {
    socket_init();
}

void reset(void) {
    // debug("开始更新mudlist 🧡💛💚");
    List = ({});
    socket_write(Socket, "mudlist", MUD_DNS);
}

int main(object me, string arg) {
    string output;

    if (arg == "-U") {
        reset();
    }

    if (!sizeof(List))
        return notify_fail("MUDLIST更新中，请稍后查看 💞\n");

    output = WHT BBLU " MUD名称                  MUD地址                  在线人数    驱动·版本   \n" NOR
        "---------------------------------------------------------------------------\n";
    foreach (mapping mud in List) {
        if (undefinedp(mud["USERS"])) {
            // continue;
            mud["USERS"] = "--";
        }

        output += sprintf(" %-25s%-25s%-12s%-s" NOR + "\n",
            mud["MUDNAME"] || mud["NAME"], mud["HOSTADDRESS"] + ":" + mud["PORT"],
            mud["USERS"], mud["DRIVER"] || mud["VERSION"] || "--");
    }
    output += "---------------------------------------------------------------------------\n";

    if (objectp(me))
        me->start_more(output);
    else
        write(output + "\n");

    return 1;
}

int help() {
    write(@HELP
指令格式 : mudlist2 [-U]

这个指令让你列出目前跟炎黄 Mud 取得联系中的其他 Mud。
HELP);
    return 1;
}
