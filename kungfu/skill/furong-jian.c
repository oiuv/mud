#include <ansi.h>
inherit SKILL;

mapping *action = ({
([
        "action" : "$N手中$w“嗖”地递出，突然间半空挽出一个剑花，正是一招「芙蓉花开」\n"
                   "不知不觉间，$w已经向$n的$l刺去",
        "force"  : 45,
        "dodge"  : 18,
        "parry"  : 20,
        "attack" : 10,
        "damage" : 20,
	"lvl"    : 0,
        "damage_type" : "刺伤",
        "skill_name"  : "芙蓉花开"
]),
([      "action" :  "$N手中$w一抖，发出嗡嗡之声，向$n眼睛刺去，但是$w在半路忽地一转\n"
                    "竟向$n$l刺去，正是芙蓉剑法中的「花开花谢」",
        "force"  :  90,
        "dodge"  :  28,
        "parry"  :  40,
        "attack" :  24,
        "damage" :  35,
	"lvl"    :  25,
        "damage_type" : "刺伤",
        "skill_name"  : "花开花谢"
]),
([
        "action" : "$N不理会对方攻势来路，手中$w刷的一剑「泉鸣芙蓉」，向$n$l刺去",
        "force"  : 110,
        "dodge"  : 32,
        "parry"  : 40,
        "attack" : 30,
        "damage" : 40,
	"lvl"    : 50,
        "damage_type" : "刺伤",
        "skill_name"  : "泉鸣芙蓉"
]),
([
        "action" : "$N手中$w倏地刺出，剑势穿插迂回，如梦如幻，正是一招「花香四溢」，向\n"
                   "$n$l刺去",
        "force"  : 120, 
        "dodge"  : 50,
        "parry"  : 42,
        "attack" : 35,
        "damage" : 48,
	"lvl"    : 75,
        "damage_type" : "刺伤",
        "skill_name"  : "花香四溢"
]),
([
        "action" : "$N手中$w倏地刺出，极尽诡奇之能事，动向无定，不可捉摸。正是一招\n"
                   "「借花献佛」指向$n$l",
        "force"  : 150,
        "dodge"  : 75,
        "parry"  : 60,
        "attack" : 55,
        "damage" : 60,
	"lvl"    : 100,
        "damage_type" : "刺伤",
        "skill_name"  : "借花献佛"
]),
([
        "action" : "$N飞身跃起，一式「芙蓉出水」$w发出一声龙吟从半空中刺向$n的$l",
        "force"  : 180,
        "dodge"  : 85,
        "parry"  : 68,
        "attack" : 65,
        "damage" : 70,
	"lvl"    : 120,
        "damage_type" : "刺伤",
        "skill_name"  : "芙蓉出水"
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
        	return notify_fail("你的内力不够，没有办法练芙蓉剑法。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 60)
           	return notify_fail("你的基本剑法火候不够，无法学习芙蓉剑法。\n");

        if (me->query_skill("sword", 1) < me->query_skill("furong-jian", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的芙蓉剑法。\n");

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

        level = (int) me->query_skill("furong-jian", 1);
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
        	   return notify_fail("你的内力不足，没有办法练习芙蓉剑法。\n");

       if ((int)me->query("qi") < 65)
        	   return notify_fail("你的体力不够练芙蓉剑法。\n");

       me->receive_damage("qi", 40);
       me->add("neili", -50);
       return 1;
}

string perform_action_file(string action)
{
        return __DIR__"furong-jian/" + action;
}

