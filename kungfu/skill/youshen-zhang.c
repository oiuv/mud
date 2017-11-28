// youshen-zhang.c 游身八卦掌

inherit SKILL;

string *dodge_msg = ({
        "$n身形微微一晃，轻飘飘拍出一掌，借力一晃，身形已落至$N十步之外。\n",
        "$n游身穿梭，单掌飘忽不定，缤纷拍出，将$N的攻势全部挡回，只能自保。\n",
        "$n双足轻轻点地，猛的拔地而起，躲开了$N的招式。\n",
});

mapping *action = ({
([      "action" : "$N身形游走不定，在$n身旁围绕数圈，陡然间“呼”的一掌向$n$l劈落",
        "force" : 260,
        "attack": 40,
        "dodge" : 90,
        "parry" : 90,
        "damage": 30,
        "lvl"   : 0,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N身形一展，已然拔地而起，双掌缤纷拍出数掌，尽数攻向$n的$l",
        "force" : 290,
        "attack": 40,
        "dodge" : 100,
        "parry" : 100,
        "damage": 30,
        "lvl"   : 60,
        "damage_type" : "瘀伤",
]),
([      "action" : "$N抽身跃起，退后数步，陡然间却又疾身而上，朝着$n的$l处猛拍一掌",
        "force" : 320,
        "attack": 45,
        "dodge" : 115,
        "parry" : 115,
        "damage": 35,
        "lvl"   : 120,
        "damage_type" : "瘀伤",
]),
});

int valid_enable(string usage) { return usage == "unarmed" ||  usage == "parry" ||  usage == "dodge"; } 

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("学习游身八卦掌必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学游身八卦掌。\n");

        if ((int)me->query_skill("dodge", 1) < 80)
                return notify_fail("你的基本轻功火候不够，无法学游身八卦掌。\n");

        if ((int)me->query_skill("unarmed", 1) < 80)
                return notify_fail("你的基本拳脚火候不够，无法学游身八卦掌。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力太弱，无法练游身八卦掌。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("youshen-zhang", 1))
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的游身八卦掌。\n");

        if ((int)me->query_skill("dodge", 1) < (int)me->query_skill("youshen-zhang", 1))
                return notify_fail("你的基本轻功水平有限，无法领会更高深的游身八卦掌。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
            if(level >= action[i]["lvl"])
               return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("youshen-zhang", 1);
        for(i = sizeof(action); i > 0; i--)
            if(level > action[i-1]["lvl"])
                return action[NewRandom(i, 20, level/5)];
}

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 100)
               return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 80)
               return notify_fail("你的内力不够游身八卦掌。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -60);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"youshen-zhang/" + action;
}
