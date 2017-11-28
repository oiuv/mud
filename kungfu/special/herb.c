// herb.c 本草知识
// Created by Vin 6/13/2002

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIG "本草知识" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能可使你更快更有效的吸收各类药物，不需要运用。\n");
}

