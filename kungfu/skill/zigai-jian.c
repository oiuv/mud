#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" :  "$N左晃右蹿，手中$w突然刺向$n$l，正是一招「峰回路转」",
        "force"  :  45,
        "dodge"  :  20,
        "parry"  :  20,
        "attack" :  10,
        "damage" :  20,
	"lvl"    :  0,
        "damage_type" :  "刺伤",
        "skill_name"  :  "峰回路转",
]),
([      "action" :  "$N越攻越猛，突然间手中$w剑光暴涨，一招「姹紫嫣红」已然使出\n"
                    "$n只觉眼前剑光耀眼，不由得心中一惊",
        "force"  :  90,
        "dodge"  :  26,
        "parry"  :  40,
        "attack" :  24,
        "damage" :  35,
	"lvl"    :  25,
        "damage_type" :  "刺伤",
        "skill_name"  :  "姹紫嫣红",
]),
([     
        "action" :  "$N以攻为守，以进为退，手中$w刷的一剑「蜻蜓点水」，向$n$l刺去",
        "force"  :  110,
        "dodge"  :  35,
        "parry"  :  40,
        "attack" :  30,
        "damage" :  40,
	"lvl"    :  50,
        "damage_type":  "刺伤",
        "skill_name":   "蜻蜓点水",
]),
([      
        "action" :  "$N轻啸一声，$w径直向$n$w，这一剑虽无任何招式，但是$N却使得不\n"
                    "卑不亢，毫无滞带，将「千山暮雪」这一招发挥到了及至",
        "force"  :  120, 
        "dodge"  :  48,
        "parry"  :  45,
        "attack" :  35,
        "damage" :  48,
	"lvl"    :  75,
        "damage_type" :  "刺伤",
        "skill_name"  :  "千山暮雪",
]),
([      
        "action" : "$N将$w一挥，长啸一声，腾空而起，使出一式「鹤翔紫盖」！这一招来得又\n"
                   "快又准，$w直指$n$l,",
        "force"  :  160,
        "dodge"  :  82,
        "parry"  :  66,
        "attack" :  55,
        "damage" :  60,
	"lvl"    :  100,
        "damage_type" :  "刺伤",
        "skill_name"  :  "鹤翔紫盖",
]),
});

string main_skill()
{
	return "wushen-jian";
}

int valid_learn(object me)
{
    	object ob; 

        if (me->query_skill("wushen-jian", 1) > 0)
                return notify_fail("你已演练合成了衡山五神剑，不必再单独学习。\n");

    	if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "sword")
        	return notify_fail("你必须先找一把剑才能练剑法。\n");

    	if ((int)me->query("max_neili") < 300)
        	return notify_fail("你的内力不够，没有办法练紫盖剑法。\n");

    	if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅。\n");

    	if ((int)me->query_skill("sword", 1) < 60)
           	return notify_fail("你的基本剑法火候不够，无法学习紫盖剑法。\n");

    	if (me->query_skill("sword", 1) < me->query_skill("zigai-jian", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的紫盖剑法。\n");

        return 1;
}

int valid_enable(string usage)
{
    	return usage == "sword" || usage == "parry";
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
	int i, level;

        level = (int) me->query_skill("zigai-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
       object weapon;

       if (! objectp(weapon = me->query_temp("weapon"))
          || (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

       if((int)me->query("neili") < 60 )
        	   return notify_fail("你的内力不足，没有办法练习紫盖剑法。\n");

       if ((int)me->query("qi") < 65)
        	   return notify_fail("你的体力不够练紫盖剑法。\n");

       me->receive_damage("qi", 40);
       me->add("neili", -50);
       return 1;
}

string perform_action_file(string action)
{
        return __DIR__"zigai-jian/" + action;
}

