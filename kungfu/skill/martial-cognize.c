// 武学修养

inherit SKILL;

int valid_learn(object me)
{
        return notify_fail("武学修养是你武学方面的领悟，无法"
                           "通过简单学习获得提升。\n");
}

int valid_research(object me)
{
        return notify_fail("武学修养来自你对实战体会的汲取吸"
                           "收，无法通过研究提升。\n");
}
