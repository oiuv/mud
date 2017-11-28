#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N使一招「伏魔式」，双手猛地袭向$n$l",
        "force" : 250,
        "attack": 55,
        "dodge" : 70,
        "parry" : 60,
        "damage": 20,
        "lvl"   : 0,
        "damage_type": "瘀伤"
]),
([      "action": "$N左拳直出，钢劲有力，一招「天玄式」砸$n的$l",
        "force" : 270,
        "attack": 60,
        "dodge" : 80,
        "parry" : 80,
        "damage": 35,
        "lvl"   : 30,
        "damage_type": "瘀伤"
]),
([      "action": "$N左右双拳齐出，风声呼呼，一招「游龙式」击向$n$l",
        "force" : 310,
        "attack": 75,
        "dodge" : 100,
        "parry" : 100,
        "damage": 50,
        "lvl"   : 60,
        "damage_type": "瘀伤"
]),
([      "action": "$N一拳挥出，招式简单之极，但是这招却使得不卑不亢，气势雄浑，一招「魔惊式」拍向$n的$l",
        "force" : 330,
        "attack": 75,
        "dodge" : 110,
        "parry" : 100,
        "damage": 55,
        "lvl"   : 90,
        "damage_type": "瘀伤"
]),
([      "action": "$N使一招「大伏魔式」，$n心中一惊，已被$N双拳笼罩",
        "force" : 350,
        "attack": 80,
        "dodge" : 130,
        "parry" : 120,
        "damage": 66,
        "lvl"   : 120,
        "damage_type": "瘀伤"
]),
([      "action": "$N拳法顿快，使出「无诲式」，转眼间，数拳已袭向$n",
        "force" : 380,
        "attack": 85,
        "dodge" : 140,
        "parry" : 130,
        "damage": 80,
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
                return notify_fail("练大伏魔拳必须空手。\n");

        if (me->query("str") < 32)
                return notify_fail("你先天臂力太弱，无法练大伏魔拳。\n");

	if ((int)me->query("max_neili") < 1500)
                return notify_fail("你的内力太弱，无法练大伏魔拳。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候不够，无法练大伏魔拳。\n");

        if ((int)me->query_skill("unarmed", 1) < 120)
                return notify_fail("你的基本拳脚火候不够，无法练大伏魔拳。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("dafumo-quan", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的大伏魔拳。\n");

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
        level = (int)me->query_skill("dafumo-quan", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int query_effect_parry(object attacker, object me)
{
        int lvl;

        if (me->query_temp("weapon"))
                return 0;

        lvl = me->query_skill("dafumo-quan", 1);
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


mixed valid_damage(object ob, object me, int damage, object weapon)
{
        mapping result;
        int ap, dp;

        if ((int)me->query_skill("dafumo-quan", 1) < 100
           || ! living(me)
           || me->query_temp("weapon")
           || ob->query_temp("weapon"))
                return;

        ap = ob->query_skill("force");
        dp = me->query_skill("unarmed", 1) / 2 +
             me->query_skill("dafumo-quan", 1);

        if (ap / 2 + random(ap) < dp)
        {
                result = ([ "damage": -damage ]);

                switch (random(3))
                {
                case 0:
                        result += (["msg" : HIG "$n" HIG "左臂随意格挡，$N" + HIG
                                            "这招力道竟然落空。\n" NOR]);
                        break;
                case 1:
                        result += (["msg" : HIG "$n" HIG "怒喝一声，出拳格挡，拳风呼呼，$N" HIG
                                            "顿觉得双臂酸麻。\n" NOR]);
                        break;
                default:
                        result += (["msg" : HIG "$n" HIG "不退反进，一拳直出，钢劲无比，$N"
                                            HIG "连忙收招回缩，不敢硬碰。\n" NOR]);
                        break;
                }
                return result;
        }
}

string perform_action_file(string action)
{
	return __DIR__"dafumo-quan/" + action;
}
