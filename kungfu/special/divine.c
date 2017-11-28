// divine.c 移经易脉
// Created by Vin 1/9/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIR "移经易脉" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够使你疗伤更快，不需要运用。\n");
}

