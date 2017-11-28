

#include <ansi.h>

inherit F_CLEAN_UP;

int is_scborn() { return 1; }

string name() { return HIG "诸邪辟易" NOR; }

int perform(object me, string skill)
{
        return notify_fail("你轮回时因机缘巧合，碰巧得到神力庇佑，\n"
                           "从而百毒不侵，诸邪无犯。有此特技者不受\n"
                           "病痛之苦，无毒发之灾，化解各种功法反噬\n"
                           "也是轻而易举。\n");
}