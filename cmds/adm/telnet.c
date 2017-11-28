// telnet

#include <ansi.h>
#include <net/dns.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        mapping minfo;
        object tob;

        if (! SECURITY_D->valid_grant(me, "(admin)"))
                return 0;

        seteuid(getuid());

        if (! arg)
                return notify_fail("你要连接哪里？\n");

        if (mapp(minfo = DNS_MASTER->query_mud_info(arg)))
        {
                arg = minfo["HOSTADDRESS"] + " " + minfo["PORT"];
                write("连接" + minfo["NAME"] + "(" + arg + ")\n");
        } else
        if (sscanf(arg, "%*s %*s") != 2)
                arg += " 23";

        tob = new("/shadow/telnet");
        if (tob->do_shadow(me, 1) != me)
        {
                write("系统错误，映射失败。\n");
                return 1;
        }

        tob->connect_to(arg);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式: telnet <MUD> | <主机地址> [<目的端口>]

这个指令让你可以连接另外一个服务器。

连接时输入 CLOSE 命令可以终止连接。

HELP );
        return 1;
}
