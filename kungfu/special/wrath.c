// wrath.c 愤怒之心
// Created by Vin 25/5/2002

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIR "愤怒之心" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够增加你的加怒上限，不需要运用。\n");
}

