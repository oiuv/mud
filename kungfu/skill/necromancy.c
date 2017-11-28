// necromancy.c 降伏法
// by Java

inherit SKILL;

int valid_learn(object me)
{
    if( (int)me->query_skill("longxiang",1) <
        (int)me->query_skill("necromancy",1) )
      return notify_fail("你的龙相般若功太低了，无法修炼更高深的降伏法。\n");

    return 1;
}

int practice_skill(object me)
{
    return notify_fail("降伏法只能靠学(learn)来提高。\n");
}

