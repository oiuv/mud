// cunning.c 八面玲珑
// Created by Vin 26/3/2002

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIC "八面玲珑" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够使你获得更多的门派贡献值，不需要运用。\n");
}

