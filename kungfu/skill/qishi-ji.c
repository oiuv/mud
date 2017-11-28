// qishi-ji.c 圣骑士戟

inherit SKILL;

mapping *action = ({
([      "action": "$N双目怒睁，手中$w猛然刺出，疾若闪电",
        "force" : 100,
        "attack": 35,
        "dodge" : 10,
        "parry" : 5,
        "lvl"   : 0,
        "damage": 85,
        "damage_type" : "刺伤"
]),
([      "action": "$N双手所持的$w转动不已，猛的疾刺向$n而去",
        "force" : 125,
        "attack": 42,
        "dodge" : 10,
        "parry" : 15,
        "damage": 100,
        "lvl"   : 10,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中的$w连续变换几个方向，最后突然直刺$n的$l",
        "force" : 150,
        "attack": 45,
        "dodge" : 15,
        "parry" : 25,
        "damage": 100,
        "lvl"   : 30,
        "damage_type" : "刺伤"
]),
([      "action": "$N手中的$w猛然缩回，随即刺向$n，去势异常凶猛",
        "force" : 160,
        "attack": 50,
        "dodge" : 25,
        "parry" : 29,
        "damage": 110,
        "lvl"   : 50,
        "damage_type" : "刺伤"
]),
([      "action": "$N跨前一不，双手将$w一压，斜斜的挑向$n的$l",
        "force" : 180,
        "attack": 48,
        "dodge" : 20,
        "parry" : 31,
        "damage": 115,
        "lvl"   : 80,
        "damage_type" : "刺伤"
]),
([      "action": "$N大喝一声，$w便如闪电般刺出，携着一股旋风刺向$n",
        "force" : 240,
        "attack": 52,
        "dodge" : 25,
        "parry" : 37,
        "damage": 120,
        "lvl"   : 100,
        "damage_type" : "刺伤"
]),
([      "action": "$N跨前几步，$w奋力前刺，义无反顾的攻向$n",
        "force" : 260,
        "attack": 55,
        "dodge" : 15,
        "parry" : 37,
        "damage": 125,
        "lvl"   : 120,
        "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) { return usage == "club" || usage == "parry"; } 

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够。\n");

        if ((int)me->query_skill("club", 1) < (int)me->query_skill("qishi-ji", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的圣骑士戟。\n");

        if ((int)me->query_skill("club", 1) < (int)me->query_skill("qishi-ji", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的圣骑士戟。\n");

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
        level = (int) me->query_skill("qishi-ji", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "club")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练圣骑士戟。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够练圣骑士戟。\n");

        me->receive_damage("qi", 70);
        me->add("neili", -40);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qishi-ji/" + action;
}
