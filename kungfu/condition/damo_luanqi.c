#include <ansi.h>
#include <condition.h>

inherit F_CLEAN_UP;
inherit "/inherit/condition/damo";

string name() { return "damo_luanqi"; }

string chinese_name() { return "乱气之扰"; }

string update_msg_others()
{
        return HIM "$N" HIM "惨哼两声，整个人摇摇晃晃，便似"
               "醉酒一般。\n" NOR;
}

string update_msg_self()
{
        return HIR "忽然觉得一阵难受，心虚气短，看来是受到达"
               "摩乱气剑的干扰。\n" NOR;
}

string die_msg_others()
{
        return HIR "$N" HIR "倒在地上呻吟了半天，最后终于渐"
               "渐没有了声音。\n" NOR;
}

string die_reason(string name)
{
        return "气尽身亡了";
}

int qi_damage(object me, mapping cnd)
{
        int d;

        d = cnd["level"];

        if (d > 300 )
                d = 100 + (d - 300) / 12;
        else
        if (d > 60)
                d = 60 + (d - 60 ) / 6;
        if (d < 10) d = 10;

        return d / 2 + random(d);
}
