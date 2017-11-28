// xiuluo-dao.c 修罗刀
// modified by Venus Oct.1997

inherit SHAOLIN_SKILL;

mapping *action = ({
([      "action": "$N藏刀内收，一招「割肉饲鹰」，刀锋自下而上划了个半弧，向$n的"
                  "$l挥去",
        "force" : 120,
        "attack": 30,
        "dodge" : 2,
        "parry" : 10,
        "damage": 30,
        "lvl"   : 0,
        "skill_name" : "割肉饲鹰",
        "damage_type": "割伤"
]),
([      "action": "$N左掌虚托右肘，一招「投身饿虎」，手中$w笔直划向$n的$l",  
        "force" : 130,
        "attack": 42,
        "dodge" : 10,
        "parry" : 18,
        "damage": 40,
        "lvl"   : 40,
        "skill_name" : "投身饿虎",
        "damage_type": "割伤"
]),
([      "action": "$N一招「斫头谢天」，$w绕颈而过，刷地一声自上而下向$n猛劈",
        "force" : 140,
        "attack": 50,
        "dodge" : 15,
        "parry" : 28,
        "damage": 45,
        "lvl"   : 60,
        "skill_name" : "斫头谢天",
        "damage_type": "割伤"
]),
([      "action": "$N右手反执刀柄，一招「折骨出髓」，猛一挫身，$w直向$n的颈中斩去",
        "force" : 160,
        "attack": 62,
        "dodge" : 25,
        "parry" : 30,
        "damage": 45,
        "lvl"   : 80,
        "skill_name" : "折骨出髓",
        "damage_type": "割伤",
]),
([      "action": "$N一招「挑身千灯」，无数刀尖化作点点繁星，向$n的$l挑去",
        "force" : 180,
        "attack": 65,
        "dodge" : 18,
        "parry" : 31,
        "damage": 50,
        "lvl"   : 100,
        "skill_name" : "挑身千灯",
        "damage_type": "割伤"
]),
([      "action": "$N双手合执$w，一招「挖眼布施」，拧身急转，刀尖直刺向$n的双眼",
        "force" : 210,
        "attack": 72,
        "dodge" : 22,
        "parry" : 32,
        "damage": 55,
        "lvl"   : 120,
        "skill_name" : "挖眼布施",
        "damage_type": "割伤"
]),
([      "action": "$N一招「剥皮书经」，手中$w划出一个大平十字，向$n纵横劈去",
        "force" : 240,
        "attack": 74,
        "dodge" : 25,
        "parry" : 35,
        "damage": 60,
        "lvl"   : 130,
        "skill_name" : "剥皮书经",
        "damage_type": "割伤"
]),
([      "action": "$N反转刀尖对准自己，一招「剜心决志」，全身一个翻滚，$w向$n拦腰斩去",
        "force" : 280,
        "attack": 77,
        "dodge" : 27,
        "parry" : 41,
        "damage": 72,
        "lvl"   : 140,
        "skill_name" : "剜心决志",
        "damage_type": "割伤"
]),
([      "action": "$N一招「烧身供佛」，$w的刀光仿佛化成一簇簇烈焰，将$n团团围绕",
        "force" : 320,
        "attack": 79,
        "dodge" : 30,
        "parry" : 42,
        "damage": 88,
        "lvl"   : 150,
        "skill_name" : "烧身供佛",
        "damage_type": "割伤"
]),
([      "action": "$N刀尖平指，一招「刺血满地」，一片片切骨刀气如飓风般裹向$n的全身",
        "force" : 330,
        "attack": 87,
        "dodge" : 25,
        "parry" : 45,
        "damage": 95,
        "lvl"   : 160,
        "skill_name" : "刺血满地",
        "damage_type": "割伤"
]),
});

int valid_enable(string usage) { return usage == "blade" || usage == "parry"; } 

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("xiuluo-dao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的修罗刀法。\n");

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
        level = (int) me->query_skill("xiuluo-dao", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力不够练修罗刀。\n");

        if ((int)me->query("neili") < 80)
                return notify_fail("你的内力不够练修罗刀。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -69);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"xiuluo-dao/" + action;
}
