// clever.c 天赋聪颖
// Created by Vin 26/8/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIM "天赋聪颖" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够使你更快的吸收知识，不需要运用。\n");
}

