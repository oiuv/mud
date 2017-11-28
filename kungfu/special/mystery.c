// mystery.c 玄黄聚纳
// Created by Doing Lu 10/7/2K

#include <ansi.h>

inherit F_CLEAN_UP;

string name() { return HIY "玄黄聚纳" NOR; }

int perform(object me, string skill)
{
        return notify_fail("这项技能能够提升你的最大内力，不需要运用。\n");
}
