// This program is a part of NITAN MudLIB
// sophistry.c 诡辩奇学
// Created by Lonely 04/05/2009

#include <ansi.h>

inherit F_CLEAN_UP;

int is_scborn() { return 1; }

string name() { return HIB "诡辩奇学" NOR; }

int perform(object me, string skill)
{
        return notify_fail("精通诸子百家的各种思想学说，在辩术方面独领风\n"
                           "骚，擅此法者可淆乱是非，点石成金，指鹿为马也\n"
                           "不称奇。拥有该特技的玩家在取消师门任务时，当\n"
                           "前任务数不归零，且不降低相关能力。拥有该特技\n"
                           "的玩家师门任务获取的贡献翻倍。\n");
}

