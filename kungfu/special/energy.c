// energy.c 聚魄还虚
// Created by Vin 26/8/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIC "聚魄还虚" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够增加你的最大精气，不需要运用。\n");
}

