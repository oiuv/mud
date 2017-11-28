#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N向上跃起，一招「穹内繁星」，手中$w自下而上，击向$n的脸颊",
        "force" : 100,
        "dodge" : 0,
        "damage": 20,
        "lvl"   : 15,
        "skill_name" : "穹内繁星",
        "damage_type":  "抽伤"
]),
([      "action": "$N一招「星光夺目」，手中$w腾空一卷，直绕向$n的$l而去",
        "force" : 110,
        "dodge" : -10,
        "damage": 30,
        "lvl"   : 20,
        "skill_name" : "星光夺目",
        "damage_type":  "抽伤"
]),
([      "action": "$N一招「摇光换位」，手中$w腾空一卷，一声脆响，猛地向$n劈头打下",
        "force" : 120,
        "dodge" : -15,
        "damage": 40,
        "lvl"   : 40,
        "skill_name" : "摇光换位",
        "damage_type":  "抽伤"
]),
([      "action": "$N踏上一步，手中$w毫不停留，一招「七星聚月」，扫向$n的$l",
        "force" : 130,
        "dodge" : -30,
        "damage": 60,
        "lvl"   : 50,
        "skill_name" : "七星聚月",
        "damage_type":  "抽伤"
]),
([      "action": "$N半空一招「北斗生采」，手中$w如游龙洗空，长凤戏羽，分点$n左右",
        "force" : 150,
        "dodge" : -35,
        "damage": 70,
        "lvl"   : 60,
        "skill_name" : "北斗生采",
        "damage_type":  "抽伤"
]),
([      "action": "$N向前急进，手中$w圈转如虹，一招「朝拜天罡」，罩向$n前胸",
        "force" : 170,
        "dodge" : -40,
        "damage": 85,
        "lvl"   : 75,
        "skill_name" : "朝拜天罡",
        "damage_type":  "抽伤"
])
});

int valid_enable(string usage)
{
	return usage == "whip" || usage == "parry";
}

int valid_learn(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "whip")
                return notify_fail("你必须先找一条长鞭才能练鞭法。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候太浅，无法练天罡尘法。\n");

        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力修为太弱，无法练天罡尘法。\n");

        if ((int)me->query_skill("whip") < 20)
                return notify_fail("你的基本鞭法等级太低，无法学天罡尘法。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("tiangang-chenfa", 1))
                return notify_fail("你的基本鞭法水平有限，无法领会更高深的天罡尘法。\n");

        return 1;
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

        level = (int) me->query_skill("tiangang-chenfa", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练天罡尘法。\n");

        if ((int)me->query("neili") < 45)
                return notify_fail("你的内力不够练天罡尘法。\n");

        me->receive_damage("qi", 30);
        me->add("neili", -39);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tiangang-chenfa/" + action;
}
