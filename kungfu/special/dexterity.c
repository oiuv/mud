// dexterity.c 玲珑玉躯
// Created by Vin 1/9/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIW "玲珑玉躯" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够使你身法更高，不需要运用。\n");
}

