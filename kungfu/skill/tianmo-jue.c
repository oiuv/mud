// tianmojue.c

inherit SKILL;

#include <ansi.h>

void create() { seteuid(getuid()); }

string type() { return "knowledge"; }

int practice_skill(object me)
{
        return notify_fail("天魔诀只能靠学(learn)来提高。\n");
}
void skill_improved(object me)
{
    tell_object(me, HIR "你充满了仇恨，想道：“杀！杀！杀！我要杀尽天下人！”\n" NOR );
    me->add("shen", -200);
}



