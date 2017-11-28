#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" :  "$N右手$w慢慢指出，突然间在空中一颤，嗡嗡作响，剑光暴长，向$n刺去",
        "force"  :  110,
        "dodge"  :  28,
        "damage" :  30,
	"lvl"    :  0,
        "damage_type":  "刺伤"
]),
([      "action" :  "$N手中$w如鬼如魅，竟已绕到$n背后，$n急忙转身，耳边只听得嗡嗡两声",
        "force"  :  120,
        "dodge"  :  24,
        "damage" :  25,
	"lvl"    :  20,
        "damage_type":  "刺伤"
]),
([     
        "action" :  "$N手中$w寒光陡闪，手中的$w，猛地反刺，直指$n胸口。这一下出招快\n"
                    "极，抑且如梦如幻，正是「百变千幻衡山云雾十三式」中的绝招",
        "force"  :  120,
        "dodge"  :  24,
        "damage" :  28,
	"lvl"    :  35,
        "damage_type":  "刺伤",
        "skill_name":   "百变千幻",
]),
([      
        "action" :  "$N不慌不忙犹如蓄势待发，手中$w刷的一剑「剑发琴音」，向$n$l刺去",
        "force"  :  130, 
        "dodge"  :  30,
        "damage" :  35,
	"lvl"    :  50,
        "damage_type":  "刺伤",
        "skill_name":   "剑发琴音",
]),
([      
        "action" : "$N飞身跃起，一式「岁岁青苍」，$w发出一声长啸从半空中洒向$n的$l",
        "force"  :  160,
        "dodge"  :  38,
        "damage" :  45,
	"lvl"    :  75,
        "damage_type":  "刺伤",
        "skill_name":   "岁岁青苍",
]),
});

int valid_learn(object me)
{
    	object ob; 

    	if (! (ob = me->query_temp("weapon"))
           || (string)ob->query("skill_type") != "sword")
        	return notify_fail("你必须先找一把剑才能练剑法。\n");

    	if ((int)me->query("max_neili") < 80)
        	return notify_fail("你目前的内力修为不够，没有办法练衡山剑法。\n");

    	if (me->query_skill("sword", 1) < 10)
		return notify_fail("你的基本剑法火候太浅，没有办法练衡山剑法。\n");

    	if (me->query_skill("sword", 1) < me->query_skill("henshan-jian", 1))
		return notify_fail("你的基本剑法火候有限，无法领会更高深的衡山剑法。\n");

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

        level = (int) me->query_skill("henshan-jian", 1);
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

        if ((int)me->query("neili") < 40)
       	        return notify_fail("你的内力不足，没有办法练习衡山剑法。\n");

        if ((int)me->query("qi") < 50)
        	return notify_fail("你的体力不够练衡山剑法。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -30);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"henshan-jian/" + action;
}

