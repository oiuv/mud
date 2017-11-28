// guimai.c 六阴鬼脉
// Created by rcwiz for yhonline

#include <ansi.h>

inherit F_CLEAN_UP;

int is_scborn() { return 1; }

string name() { return HIR "六阴鬼脉" NOR; }

int perform(object me, string skill)
{
        return notify_fail("乃世间千年一遇的特殊经脉，此脉至阴至\n"
                           "寒，身俱此经脉的婴儿常被误诊为寒毒缠\n"
                           "身，医而不得其法，导致幼年夭折。无论\n"
						               "男女，均可直接修炼辟邪剑法或是葵花魔\n"
						               "功，无需再作自宫。鬼脉者生命值上限比\n"
						               "一般人要低，但内力上限比一般人高，且\n"
						               "研读葵花宝典时极大降低走火入魔几率、\n"
						               "研究葵花魔功和辟邪剑法时大幅降低难度。\n");
}