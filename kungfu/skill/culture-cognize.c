// 文学修养

inherit SKILL;

int valid_learn(object me)
{
        return notify_fail("文学修养是你文化方面的体会，无法"
                           "通过简单学习获得提升。\n");
}

int valid_research(object me)
{
        return notify_fail("文学修养来自你对文化精髓的汲取吸"
                           "收，无法通过研究提升。\n");
}
