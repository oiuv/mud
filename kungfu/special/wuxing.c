
#include <ansi.h>

inherit F_CLEAN_UP;

int is_scborn() { return 1; }

string name() { return HIW "武星转世" NOR; }

int perform(object me, string skill)
{
        return notify_fail("你在转世时巧遇武曲星投胎转世，获\n"
                           "取武曲星附体转生，拥有常人没有的\n"
                           "武学领悟能力。转生后拥有该技能可\n"
                           "提高所有武学研究速度百分之二十，\n"
                           "各种武学练习速度提高百分之二十，\n"
                           "武学修养获取速度提高百分之二十。\n");
}
