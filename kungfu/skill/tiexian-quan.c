inherit SKILL;

mapping *action = ({
([      "action" : "只见$N身形一矮，施一招「赤胆忠心」对准$n的呼地砸了过去",
        "dodge"  : 15,
        "parry"  : 15,
        "attack" : 20,
        "force"  : 120,
        "damage_type":  "砸伤"
]),
([      "action" : "$N左拳拉开，右拳带风，一招「忠心耿耿」势不可挡地击向$n",
        "dodge"  : 25,
        "parry"  : 25,
        "attack" : 30,
        "force"  : 140,
        "damage_type":  "瘀伤"
]),
([      "action" : "只见$N拉开架式，双拳带风，施一招「铁门闸」蓦地拍向$n而去",
        "dodge"  : 20,
        "parry"  : 20,
        "attack" : 25,
        "force"  : 160,
        "damage_type" : "瘀伤"
]),
([      "action" : "$N一个转身，左掌护胸，右掌使出「直来直去」往$n当头一拳",
        "dodge"  : 30,
        "parry"  : 30,
        "attack" : 40,
        "force"  : 270,
        "damage_type" : "砸伤"
]),
});

int valid_enable(string usage)
{
        return usage == "cuff" || usage == "parry";
}

int valid_combine(string combo)
{
        return combo == "chuanxin-zhang";
}

int valid_learn(object me)
{
        if( me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练铁线拳法必须空手。\n");

        if ((int)me->query_skill("cuff", 1) < 20)
                return notify_fail("你的基本拳法火候不足，难以修炼铁线拳法。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("tiexian-quan", 1))
                return notify_fail("你的拳法根基火候不足，无法领会更高深的铁线拳法。\n");

        return 1;
}

string query_skill_name(int lvl)
{
        return action[random(sizeof(action))]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 40)
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if ((int)me->query("neili") < 25)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -22);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tiexian-quan/" + action;
}
