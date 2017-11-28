// sanxiao_poison.c

#include <ansi.h>

inherit F_CLEAN_UP;
inherit POISON;

string name() { return "sanxiao_poison"; }

string chinese_name() { return "逍遥三笑散之毒"; }

string update_msg_others()
{
       return HIG "$N" HIG "脸上忽然露出诡异的一笑！\n" NOR;
}

string update_msg_self()
{
        return HIG "不知怎么的，你忽然发现自己控制不了脸部肌肉，不由自主的笑了一下！\n" NOR;
}

string die_msg_others()
{
        return RED "$N" RED "脸上露出诡异的笑容，似乎很幸福。\n" NOR;
}

string die_reason(string name)
{
        return "中了" + chinese_name() + "，幸福的咽下了最后一口气";
}

int jing_damage(object me, mapping cnd)
{
        int d;

        d = cnd["level"];
        if (me->query_skill("xingxiu-poison") > 50) d /= 2;
        return d / 2;
}

int qi_damage(object me, mapping cnd)
{
        int d;

        d = cnd["level"];
        if (me->query_skill("xingxiu-poison") > 50) d /= 2;
        return d;
}

