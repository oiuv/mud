// accuracy.c 精准射击
// Created by Vin 4/16/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIC "精准射击" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能可使你运用弓箭的命中率加倍，不需要运用。\n");
}

