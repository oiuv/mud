// xumishan-zhang.c 须弥山掌

inherit SHAOLIN_SKILL;

mapping *action = ({
([        "action": "$N前腿踢出，后腿脚尖点地，一式「五丁开山」，双掌直击$n的面门",
          "force" : 150,
          "attack": 15,
          "dodge" : 5,
          "parry" : 20,
          "lvl"   : 0,
          "damage_type" : "瘀伤",
          "skill_name" : "五丁开山"
]),
([        "action": "$N左掌划一半圆，一式「壁立千刃」，右掌斜穿而出，疾拍$n的胸前大穴",
          "force" : 180,
          "attack": 20,
          "dodge" : 5,
          "parry" : 20,
          "damage": 10,
          "lvl"   : 30,
          "damage_type" : "瘀伤",
          "skill_name" : "壁立千刃"
]),
([        "action": "$N使一式「云断秦岭」，右掌上引，左掌由后而上一个甩劈，斩向$n的$l",
          "force" : 200,
          "attack": 30,
          "dodge" : 5,
          "parry" : 10,
          "damage": 20,
          "lvl"   : 50,
          "damage_type" : "劈伤",
          "skill_name" : "云断秦岭"
]),
([        "action": "$N左掌护胸，右掌凝劲后发，一式「日坠苍山」，缓缓推向$n的$l",
          "force" : 240,
          "attack": 80,
          "dodge" : -5,
          "parry" : 10,
          "damage": 30,
          "lvl"   : 80,
          "damage_type" : "瘀伤",
          "skill_name" : "日坠苍山"
]),
([        "action": "$N使一式「山高云淡」，身行一纵，双掌一前一后，猛地击向$n的头顶百汇大穴",
          "force" : 250,
          "attack": 50,
          "dodge" : 20,
          "parry" : 60,
          "damage": 35,
          "lvl"   : 100,
          "damage_type" : "瘀伤",
          "skill_name" : "山高云淡"
]),
([        "action": "$N双掌合十，深吸一口气，一式「蒙蒙群山」，双掌骤然化出一片掌影，击向$n的前胸",
          "force" : 280,
          "attack": 50,
          "dodge" : 25,
          "parry" : 30,
          "damage": 40,
          "lvl"   : 125,
          "damage_type" : "瘀伤",
          "skill_name" : "蒙蒙群山"
]),
([        "action": "$N向上高高跃起，一式「高山流水」，居高临下，掌力笼罩$n的全身",
          "force" : 300,
          "attack": 60,
          "dodge" : 30,
          "parry" : 35,
          "damage": 45,
          "lvl"   : 150,
          "damage_type" : "瘀伤",
          "skill_name" : "高山流水"
]),
([        "action": "$N使一式「峰回路转」，劲气弥漫，双掌如轮，一掌强过一掌的向$n劈去",
          "force" : 350,
          "attack": 70,
          "dodge" : 30,
          "parry" : 55,
          "damage": 50,
          "lvl"   : 175,
          "damage_type" : "劈伤",
          "skill_name" : "峰回路转"
]),
([        "action": "$N两掌上下护胸，一式「山穷水尽」，骤然化为满天掌雨，攻向$n",
          "force" : 400,
          "attack": 80,
          "dodge" : 30,
          "parry" : 60,
          "damage": 55,
          "lvl"   : 200,
          "damage_type" : "瘀伤",
          "skill_name" : "山穷水尽"
]),
([        "action": "$N一式「排山倒海」，双掌一圈，全身内力如巨浪般汹涌而出，$n顿觉避无可避",
          "force" : 450,
          "attack": 100,
          "dodge" : 50,
          "parry" : 80,
          "damage": 60,
          "lvl"   : 250,
          "damage_type" : "内伤",
          "skill_name" : "排山倒海"
])
});

int valid_enable(string usage) { return usage == "strike" ||  usage == "parry"; }

int valid_combine(string combo) { return combo == "jingang-zhi"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练须弥山掌必须空手。\n");

        if ((int)me->query_skill("force", 1) < 200)
                return notify_fail("你的基本内功火候不够，无法学须弥山掌。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力太弱，无法练须弥山掌。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("xumishan-zhang", 1))
                return notify_fail("你的基本掌法水平有限，无法领会更高深的须弥山掌。\n"); 

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

        level = (int)me->query_skill("xumishan-zhang", 1);

        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 90)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 90)
                return notify_fail("你的内力不够练须弥山掌。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -75);
        return 1;
}
