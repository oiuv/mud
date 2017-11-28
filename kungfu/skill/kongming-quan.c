#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N使一招「空屋住人」，双手轻飘飘地箍向$n$l",
        "force" : 250,
        "attack": 55,
        "dodge" : 70,
        "parry" : 60,
        "damage": 10,
        "lvl"   : 0,
        "damage_type": "瘀伤"
]),
([      "action": "$N左掌一平，右掌一伸，一招「空碗盛饭」直拍$n的$l",
        "force" : 270,
        "attack": 60,
        "dodge" : 80,
        "parry" : 80,
        "damage": 15,
        "lvl"   : 30,
        "damage_type": "瘀伤"
]),
([      "action": "$N身形绕$n一转，双手上撩,一招「空钵装水」击向$n$l",
        "force" : 300,
        "attack": 75,
        "dodge" : 100,
        "parry" : 100,
        "damage": 20,
        "lvl"   : 60,
        "damage_type": "瘀伤"
]),
([      "action": "$N左掌一按，右掌一挥,一招「虚怀若谷」拍向$n的$l",
        "force" : 320,
        "attack": 75,
        "dodge" : 110,
        "parry" : 100,
        "damage": 25,
        "lvl"   : 90,
        "damage_type": "瘀伤"
]),
([      "action": "$N使一招「空山鸟语」，$n的$l已围在$N的重重掌影之下",
        "force" : 340,
        "attack": 80,
        "dodge" : 130,
        "parry" : 120,
        "damage": 30,
        "lvl"   : 120,
        "damage_type": "瘀伤"
]),
([      "action": "$N神色一敛，使出「我心空明」，围绕$n的$l接连出掌",
        "force" : 370,
        "attack": 85,
        "dodge" : 140,
        "parry" : 130,
        "damage": 40,
        "lvl"   : 150,
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage)
{
	return usage == "unarmed" || usage == "parry";
}

int valid_learn(object me)
{
	if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练空明拳必须空手。\n");

	if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力太弱，无法练空明拳。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，无法练空明拳。\n");

        if ((int)me->query_skill("unarmed", 1) < 120)
                return notify_fail("你的基本拳脚火候不够，无法练空明拳。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("kongming-quan", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的空明拳。\n");

	return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i - 1]["lvl"])
                        return action[i - 1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("kongming-quan", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        int ap, dp;

        if ((int)me->query_skill("kongming-quan", 1) < 100
           || ! living(me)
           || me->query_temp("weapon")
           || ob->query_temp("weapon"))
                return;

        ap = ob->query_skill("force");
        dp = me->query_skill("unarmed", 1) / 2 +
             me->query_skill("kongming-quan", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(2))
                {
                case 0:
                        result += (["msg" : HIG "$n" HIG "双臂一格，$N" + HIG
                                            "登时觉得自己的力道全然落空。\n"
                                            NOR]);
                        break;
                case 1:
                        result += (["msg" : HIG "$n" HIG "随意格挡，让$N" HIG 
                                            "只觉得自己全然捕捉不到$n" HIG "的"
                                            "力道。\n" NOR]);
                        break;
                default:
                        result += (["msg" : HIG "$n" HIG "慢慢出拳左挡右格，让"
                                            "$N" HIG "只觉得力道无处可使，说不"
                                            "出的难受。\n" NOR]);
                        break;
                }
                return result;
        }
}

int query_effect_parry(object attacker, object me)
{
        int lvl;

        if (me->query_temp("weapon"))
                return 0;

        lvl = me->query_skill("kongming-quan", 1);
        if (lvl < 80)  return 0;
        if (lvl < 200) return 50;
        if (lvl < 280) return 80;
        if (lvl < 350) return 100;
        return 120;
}

int practice_skill(object me)
{
	if ((int)me->query("qi") < 60)
		return notify_fail("你的体力太低了。\n");

	if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够了。\n");

	me->receive_damage("qi", 50);
	me->add("neili", -60);
	return 1;
}

string perform_action_file(string action)
{
	return __DIR__"kongming-quan/" + action;
}
