// top.c

#include <ansi.h>

#define U_ID 0
#define U_NAME 1
#define U_TITLE 2
#define U_MASTER 3
#define U_AGE 5
#define U_QI 6
#define U_JING 7
#define U_NEILI 8
#define U_JINGLI 9
#define U_EXP 10
#define U_KILL 11
#define U_DIE 12
#define U_UPDATED 13

int main(object me, string arg)
{
    int i = 0, top;
    int index = 0;
    string msg;
    mixed data;
    string title;

    me = this_player();

    // 防止系统资源消耗过大，限时浏览。
    if (!wizardp(me) && time() - me->query_temp("last_view") < 15)
        return notify_fail(HIW "\n排行榜更新中……请稍侯片刻。\n" NOR);

    if (member_array(arg, ({"age", "lv", "exp", "qi", "hp" ,"jing", "neili", "jingli", "kill", "die"})) < 0)
    {
        return notify_fail("目前只提供等级(top lv)/经验(top exp)/气血(top hp)/年龄(top age)/杀敌(top kill)等全服排行。\n");
    }
    if (arg == "lv" || arg == "exp") arg = "combat_exp";
    if (arg == "hp")
        arg = "qi";

    switch (arg)
    {
    case "combat_exp":
        top = U_EXP;
        title = "经验等级";
        break;
    case "age":
        top = U_AGE;
        title = "游戏年龄";
        break;
    case "qi":
        top = U_QI;
        title = "气 血 值";
        break;
    case "jing":
        top = U_JING;
        title = "精 气 值";
        break;
    case "neili":
        top = U_NEILI;
        title = "内 力 值";
        break;
    case "jingli":
        top = U_JINGLI;
        title = "精 力 值";
        break;
    case "kill":
        top = U_KILL;
        title = "杀敌次数";
        break;
    case "die":
        top = U_DIE;
        title = "死亡次数";
        break;

    default:
        top = U_UPDATED;
        title = "活跃时间";
        break;
        break;
    }

    msg = HIW "\n                 ┏----『" HIG " 英 雄 榜 " HIW "』----┓\n";
    msg += "┏-------------------------------------------------------┓\n";
    msg += "┃ " HIG "排 行" HIW "| " HIG "姓    名" HIW
           " | " HIG "    称          号    " HIW " |  " HIG + title + HIW "  ┃\n";
    msg += "┠-------------------------------------------------------┨\n";

    data = CACHE_D->get(arg);

    if (!sizeof(data))
        msg += HIW "|        暂时空缺           无                -  |\n" NOR;
    else
        foreach(mixed user in data)
        {
            msg += sprintf(HIW "┃" HIG "  %-5d %-12s%-20s %12d  " HIW "┃\n" NOR,
                    ++i,
                    user[1],
                    user[2],
                    user[top]);
            if (user[0] == me->query("id"))
            {
                index = i;
            }
        }
    msg += HIW "┠-------------------------------------------------------┨\n" NOR;

    me->start_more(color_filter(msg));
    // write(msg);
    me->set_temp("last_view", time());
    tell_object(me, "\n" FCC(208) "提示：你的『" + title + "』在全服排行第 " + index + " 位。" NOR "\n");
    return 1;
}
