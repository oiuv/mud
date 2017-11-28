// intellect.c 罡睿神慧
// Created by Vin 1/9/2001

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIG "罡睿神慧" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够使你悟性更高，不需要运用。\n");
}

