inherit SKILL;

mapping *action = ({
([      "action" : "$N一招「飞燕入林」，手中$w轻轻颤动，一剑自上而下扎向$n的$l",
        "force"  : 120,
        "dodge"  : 20,
        "damage" : 25,
        "lvl"    : 0,
        "skill_name" : "飞燕入林",
        "damage_type": "刺伤"
]),
([      "action" : "$N身形不动，一招「虚式分金」，手中$w向前下反刺，一剑指向$n的$l",
        "force"  : 120,
        "dodge"  : 20,
        "damage" : 20,
        "lvl"    : 10,
        "skill_name" : "虚式分金",
        "damage_type": "刺伤"
]),
([      "action" : "$N右手$w先向前刺，使出一式「凤凰挚窝」，剑光如匹练般泄向$n的$l",
        "force"  : 140,
        "dodge"  : 15,
        "damage" : 25,
        "lvl"    : 20,
        "skill_name" : "凤凰挚窝",
        "damage_type": "刺伤"
]),
([      "action" : "$N碎步急进，提剑沿剑身方向疾速上刺，一招「轻罗小扇」直取$n的$l",
        "force"  : 150,
        "dodge"  : 15,
        "damage" : 35,
        "lvl"    : 30,
        "skill_name" : "轻罗小扇",
        "damage_type": "刺伤"
]),
([      "action" : "$N平剑斜洗，臂圆剑直，一式「玉女穿梭」，$w连绵不绝刺向$n的$l",
        "force"  : 130,
        "dodge"  : 25,
        "damage" : 25,
        "lvl"    : 40,
        "skill_name" : "玉女穿梭",
        "damage_type": "刺伤"
]),
([      "action" : "$N屈腕抬臂，剑由前向后上方抽带，一式「黑沼灵狐」直刺向$n的$l",
        "force"  : 120,
        "dodge"  : 25,
        "damage" : 25,
        "lvl"    : 50,
        "skill_name" : "黑沼灵狐",
        "damage_type": "刺伤"
]),
([      "action" : "$N抱剑当胸，正反搅动，右手$w一式「顺水推舟」，刺向$n的$l",
        "force" : 110,
        "dodge" : 15,
        "lvl"   : 60,
        "skill_name" : "顺水推舟",
        "damage_type": "刺伤"
]),
([      "action" : "$N侧身退步，左手剑指划转，一记「伊人消魂」自下上撩指向$n的$l",
        "force"  : 150,
        "dodge"  : 35,
        "damage" : 40,
        "lvl"    : 70,
        "skill_name" : "伊人消魂",
        "damage_type": "刺伤"
]),
});


int valid_enable(string usage) { return usage == "sword" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 20)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("emei-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的峨嵋剑法。\n");

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
        level = (int) me->query_skill("emei-jian", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];

}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 40)
                return notify_fail("你的体力不够练峨嵋剑法。\n");

        if ((int)me->query("neili") < 10)
                return notify_fail("你的内力不够练峨嵋剑法。\n");

        me->receive_damage("qi", 25);
        me->add("neili", -1);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"emei-jian/" + action;
}
