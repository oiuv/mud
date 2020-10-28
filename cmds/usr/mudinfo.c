// Modify By Linux@Lxtx for yh

inherit F_CLEAN_UP;
#include <mudlib.h>
#include <getconfig.h>
#include <ansi.h>
#include <command.h>
#define SCALE   (1.0/10.0)
#define STATUS  "系统函数库改写中"

string memory_expression(int m);
string dotime();

int count_ppls();

void create() { seteuid(getuid(this_object())); }

int main(object me)
{
    float value;
    mapping r;

    if (time() - me->query_temp("scan_time") < 10 && !wizardp(me))
        return notify_fail("等等，系统喘气中……\n");

    r = rusage();
    value = SCALE * (r["utime"] + r["stime"]) / uptime();

    write(NOR + WHT "\n\t\t         .__________ 系 统 资 讯 __________.\n");
    write(NOR + WHT "\t\t ---------------------------------------------------\n");
    write(NOR + WHT "\t\t Mud 中文名称：  " + MUD_NAME + HIW + "（" + MUD_ZONE + "）\n");
    write(NOR + WHT "\t\t Mud 驱动版本：  " + __VERSION__ + "\n");
    write(NOR + WHT "\t\t Mud 系统版本：  YH Mudlib Ver UTF-8\n");
    printf(NOR + WHT "\t\t CPU 使用占比：  %f %% 被这个 Mud 使用中\n", value);
    write(NOR + WHT "\t\t CPU 负担状况：  " + query_load_average() + "\n");
    printf(NOR + WHT "\t\t 游戏占用内存：  %s bytes\n", memory_expression(memory_info()));
    write(NOR + WHT "\t\t 线上玩家数量：  " + sizeof(users()) + " 个人在线上\n");
    write(NOR + WHT "\t\t 注册玩家总数：  " + count_ppls() + " 个人在本 Mud 注册\n");
    write(NOR + WHT "\t\t 载入对象总数：  " + sizeof(objects()) + " 个\n");
    write(NOR + WHT "\t\t 连续执行时间：  " + dotime() + "\n");
    write(NOR + WHT "\t\t Mud 现在状态：  " + STATUS + "\n\n" NOR);

    me->set_temp("scan_time", time());

    return 1;
}

string memory_expression(int m)
{
    float mem;

    mem = m;
    if (mem < 1024)
        return m + "";
    if (mem < 1024 * 1024)
        return sprintf("%.2f K", (float)mem / 1024);

    return sprintf("%.3f M", (float)mem / (1024 * 1024));
}

int count_ppls()
{
    int count, i;
    string *dir, *ppls;

    seteuid(getuid());

    dir = get_dir(DATA_DIR + "login/");
    for (i = 0; i < sizeof(dir); i++)
    {
        ppls = get_dir(DATA_DIR + "login/" + dir[i] + "/");
        count += sizeof(ppls);
    }
    return count;
}

string dotime()
{
    int t, d, h, m, s;
    string time;

    t = uptime();
    s = t % 60;
    t /= 60;
    m = t % 60;
    t /= 60;
    h = t % 24;
    t /= 24;
    d = t;

    if (d)
        time = chinese_number(d) + "天";
    else
        time = "";

    if (h)
        time += chinese_number(h) + "小时";
    if (m)
        time += chinese_number(m) + "分";
    time += chinese_number(s) + "秒\n";

    return time;
}

int help(object me) {

    write(@HELP
指令格式：mudinfo

这个指令将会显示有关这个 Mud 的一些系统资讯。

HELP
);
    return 1;
}
