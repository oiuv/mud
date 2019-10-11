// 查询在线player的ip地名，需IP_D进程和IP数据库
#include <ansi.h>
int help(object me);
int main(object me, string name)
{       
        object ob; 
        string ip;
        if( !name ) return help(me);
        seteuid(getuid());
        if( !ob = find_player(name) )
              return notify_fail("没有这个玩家。\n");
        ip = query_ip_number(ob);
        write("\n" + HIY+ob->name(1) + NOR + "IP状态如下：\n"NOR);
        write(HIY+"IP地址：" + HIR + ip + NOR + "——" + HIG + IP_D->seek_ip_address(ip) + "\n");
        write("\n");
        return 1;
}

int help(object me)
{
write(@HELP
指令格式：ipname <id>
察看某个玩家IP地址以及详细地点。
HELP
        );
    return 1;
}

