// greedy.c 饕餮转世
// Created by Vin 25/5/2002

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIR "饕餮转世" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够增加你的食物及饮水上限，不需要运用。\n");
}

