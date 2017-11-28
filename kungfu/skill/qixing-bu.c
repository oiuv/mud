#include <ansi.h>

inherit SKILL;

string *dodge_msg = ({
     "$n一式「翩翩若惊鸿」，身不倾，脚不移，身体如行云流水般直滑出丈余。\n",
     "$n一式「游龙出海」，忽然一弯腰，全身贴地而行，顿时闪过了$N的凌厉攻势。\n",
     "$n一式「倒转七星」，足不动，手不抬，一转眼间便绕到了$N的身后。\n",
     "$n一式「无影无踪」，一转身间，四面八方飘动着无数个$n的身影，令$N手足无措。\n",
     "$n一式「逆转乾坤」，左踏巽，右转乾，身行一晃，便到几丈远的地方。\n",
     "$n一式「直冲云霄」，身在空中，左脚在右足上一点，从$N头顶腾空而过。\n",
     "$n一式「芙蓉出水」，长袖一拂，全身化为一道白影，幽幽地从$N头顶飘落。\n",
     "$n一式「秋风扫落叶」，身行倏的从$N的眼前直绕到身后，$N瞪大了两眼，不明所以。\n",
     "$n一式「蓦然回手」，身行倏的从$N的眼前飘过，潇洒之极。\n",
});

int valid_enable(string usage) 
{ 
    return (usage == "dodge") || (usage == "move"); 
}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
    return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
      if((int)me->query("qi") < 40 )
           return notify_fail("你的体力太差了，不能练倒转七星步。\n");

      if((int)me->query("neili") < 30 )
           return notify_fail("你的内力太差了，不能练倒转七星步。\n");

      me->receive_damage("qi", 35);
      me->add("neill", -24);
      return 1;
}
