// taoism.c 道学心法
// modified by Venus Oct.1997

inherit SKILL;

void create() { seteuid(getuid()); }

string type() { return "knowledge"; }

int valid_learn(object me)
{
    int lvl;

    lvl = (int)me->query_skill("taoism", 1);

    if(me->query("gender") == "无性" && lvl > 19)
        return notify_fail("你刚听一会儿，便觉心智迷糊，原来你没有阳刚之\n"
                           "气，无法领会里面的阴阳变化之道。\n");

    return 1;
}

int practice_skill(object me)
{
    return notify_fail("天师正道只能靠学习来提高。\n");
}
