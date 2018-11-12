// potential.c 乾坤无量
// Created by Vin 4/16/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIB "乾坤无量" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能可使你在成为宗师前的潜能加倍，不需要运用。\n");
}

