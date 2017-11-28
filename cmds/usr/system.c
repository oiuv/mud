// system.c

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

string fs(int supplied);
string fc(int cost);

int main(object me, string arg)
{
        string msg;
        mapping cm;

        cm = CPU_D->query_entire_dbase();
        msg  = "最近一段时间系统使用CPU的情况统计：\n";
        msg += "系统提供CPU资源的满足度：" + fs(cm["last_0"]["supplied"]) +
              "  游戏对CPU的占用率：" + fc(cm["last_0"]["cost"]) + "。\n";

        msg += sprintf("前一些时间CPU的满足度和占用率：%s/%s  %s/%s  %s/%s  %s/%s。\n",
                       fs(cm["last_1"]["supplied"]), fc(cm["last_1"]["cost"]),
                       fs(cm["last_2"]["supplied"]), fc(cm["last_2"]["cost"]),
                       fs(cm["last_3"]["supplied"]), fc(cm["last_3"]["cost"]),
                       fs(cm["last_4"]["supplied"]), fc(cm["last_4"]["cost"]));
        write(msg);
        return 1;
}

int help(object me)
{
  write(@HELP
指令格式 : system
 
这个指令可以显示出目前游戏使用系统资源的状况.
 
HELP );
    return 1;
}
 
string fs(int supplied)
{
        if (supplied <= 70)
                return sprintf(RED "%d%%" NOR, supplied);
        else
        if (supplied <= 90)
                return sprintf(HIR "%d%%" NOR, supplied);

        return sprintf(WHT "%d%%" NOR, supplied);
}

string fc(int cost)
{
        if (cost >= 90)
                return sprintf(RED "%d%%" NOR, cost);
        else
        if (cost >= 70)
                return sprintf(HIR "%d%%" NOR, cost);

        return sprintf(WHT "%d%%" NOR, cost);
}
