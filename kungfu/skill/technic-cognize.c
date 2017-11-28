// 技能修养

inherit SKILL;

int valid_learn(object me)
{
        return notify_fail("技能修养是你工艺技能方面的体会，无法"
                           "通过简单学习获得提升。\n");
}

int valid_research(object me)
{
        return notify_fail("技能修养来自你对工艺技术精髓的熟悉"
                           "运用，无法通过研究提升。\n");
}
