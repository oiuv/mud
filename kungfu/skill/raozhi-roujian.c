// raozhi-roujian.c 武当绕指柔剑

inherit SKILL;

mapping *action = ({
([      "action" : "$N使出一招「天外流星」，手中$w如一条银蛇般刺向$n的$l",
        "force"  : 120,
        "dodge"  : 20,
        "parry"  : 14,
        "damage" : 25,
        "lvl"    : 0,
        "damage_type": "刺伤"
]),
([      "action" : "$N一式「落花满天」，手中$w化做满天剑影直刺向$n的$l",
        "force"  : 120,
        "dodge"  : 20,
        "parry"  : 15,
        "damage" : 20,
        "lvl"    : 10,
        "damage_type": "刺伤"
]),
([      "action" : "$N使出一招「窗含柔月」，手中$w挥舞，舞出数个剑花圈向$n的$l",
        "force"  : 140,
        "dodge"  : 15,
        "parry"  : 16,
        "damage" : 25,
        "lvl"    : 20,
        "damage_type": "刺伤"
]),
([      "action" : "$N轻轻一跃，一招「乘风归去」，却在转身之际对准$n$l斜斜挥出一剑",
        "force"  : 150,
        "dodge"  : 15,
        "parry"  : 18,
        "damage" : 35,
        "lvl"    : 30,
        "damage_type": "刺伤"
]),
([      "action" : "$N神态悠闲，手中$w凭空一指，一招「白云千载」轻妙地划向$n的$l",
        "force"  : 130,
        "dodge"  : 25,
        "parry"  : 21,
        "damage" : 25,
        "lvl"    : 40,
        "damage_type": "刺伤"
]),
([      "action" : "$N使出一招「星河影动」，剑光闪烁不定，若有若无地刺向$n$l",
        "force"  : 120,
        "dodge"  : 25,
        "parry"  : 22,
        "damage" : 25,
        "lvl"    : 50,
        "damage_type": "刺伤"
]),
([      "action" : "$N手中$w向外一分，一招「柳暗花明」反手对准$n$l一剑刺去",
        "force"  : 110,
        "dodge"  : 15,
        "parry"  : 35,
        "damage" : 38,
        "lvl"    : 60,
        "damage_type": "刺伤"
]),
([      "action" : "$N身形转个不停，突然一招「一点灵犀」使出，手中$w划出一道银弧，径刺$n$l",
        "force"  : 150,
        "dodge"  : 35,
        "parry" :  45,
        "damage" : 43,
        "lvl"    : 70,
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

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("raozhi-roujian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的绕指柔剑。\n");

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
        level = (int) me->query_skill("raozhi-roujian", 1);
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
                return notify_fail("你的体力不够练绕指柔剑。\n");

        if ((int)me->query("neili") < 40)
                return notify_fail("你的内力不够练绕指柔剑。\n");

        me->receive_damage("qi", 35);
        me->add("neili", -30);

        return 1;
}
string perform_action_file(string action)
{
        return __DIR__"raozhi-roujian/" + action;
}
