// constitution.c 镇蕴七星
// Created by Vin 1/9/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIY "镇蕴七星" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够使你根骨更高，不需要运用。\n");
}

