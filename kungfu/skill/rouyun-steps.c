// rouyun-steps.c  柔云步法
// modified by Venus Oct.1997
// Made by deaner
#include <ansi.h>
inherit SKILL;

string *dodge_msg = ({
      "$n使一式"+HIW"『云中鹤影』"NOR+"，身形纵离地面数尺，躲过了$N这一招。\n",
      "$n身形飘飘，使出一式"+MAG"『云彩飘忽』"NOR+"，避过了$N的攻击。\n",
      "$n使出一式"+HIB"『云雾缭绕』"NOR+"，$N眼前已没了$n的踪影。\n",
      "$n施展出一式"+HIG"『云雨不定』"NOR+"，身影急幌，在千钧一发间躲过了$N的攻势。\n",
      "$n衣袂飘飘，一式"+HIY"『云蒸霞蔚』"NOR+"，轻灵地避了开去。\n",
      "$n立即使出一式"+YEL"『云海浮沉』"NOR+"，沉肩滑步，微晃身影，避开了$N的攻击。\n",
      "$n立刻使一式"+BLU"『云影万千』"NOR+"，身形忽进忽退，忽左忽右，$N的攻击已然无效。\n",
});

int valid_enable(string usage)
{
    return (usage == "dodge") || (usage == "move");
}

int valid_learn(object me)
{
    if ((int)me->query_dex() <= 30)
        return notify_fail("你的身法不够，难以领会柔云步法。");

    return 1;
}

string query_dodge_msg()
{
    return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
    if( (int)me->query("qi") < 50 )
        return notify_fail(HIC"你的体力太差了，不能练柔云步法。\n"NOR);

    if( (int)me->query("neili") < 50 )
        return notify_fail(HIC"你的内力太差了，不能练柔云步法。\n"NOR);

    me->receive_damage("qi", 45);
    me->add("neili", -20);
    return 1;
}

string perform_action_file(string action)
{
    return __DIR__"rouyun-steps/" + action;
}
