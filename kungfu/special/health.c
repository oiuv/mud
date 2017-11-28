// health.c 内敛乾坤
// Created by Vin 26/8/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return WHT "内敛乾坤" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够增加你的最大气血，不需要运用。\n");
}

