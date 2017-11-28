inherit SKILL;

mapping *action = ({
([	"action" : "$N划身错步，双掌内拢外托，缓缓向$n的左肩处拍去",
        "force" : 70,
        "attack": 5,
        "dodge" : 38,
        "parry" : 38,
        "damage": 1,
        "lvl"   : 0,
        "skill_name" : "逆流捧沙",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N跨前一步，双掌以迅雷不及掩耳之势，劈向$n两额太阳穴",
        "force" : 95,
        "attack": 8,
        "dodge" : 43,
        "parry" : 43,
        "damage": 4,
        "lvl"   : 30,
        "skill_name" : "雷洞霹雳",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N单掌突起，劲气弥漫，双掌如轮，一环环向$n的后背斫去",
        "force" : 120,
        "attack": 13,
        "dodge" : 51,
        "parry" : 51,
        "damage": 8,
        "lvl"   : 60,
        "skill_name" : "摘星换斗",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N双掌似让非让，似顶非顶，气浪如急流般使$n陷身其中",
        "force" : 140,
        "attack": 15,
        "dodge" : 65,
        "parry" : 65,
        "damage": 12,
        "lvl"   : 100,
        "skill_name" : "梵心降魔",
        "damage_type" : "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "strike" ||  usage == "parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练苗家掌法必须空手。\n");

        if (me->query_skill("force") < 20)
                return notify_fail("你的内功火候不够，不能练苗家掌法。\n");

        if (me->query("max_neili") < 50)
                return notify_fail("你的内力太弱，无法练苗家掌法。\n");

        if (me->query_skill("strike", 1) < me->query_skill("miaojia-zhang", 1))
                return notify_fail("你的基本掌法太差，无法领会更高深的苗家掌法。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i-1]["lvl"])
                        return action[i-1]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int)me->query_skill("miaojia-zhang",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练习苗家掌法。\n");

        if (me->query_skill("miaojia-zhang", 1) < 100)
                me->receive_damage("qi", 20);
        else
                me->receive_damage("qi", 30);

        me->add("neili", -40);
        return 1;
}
string perform_action_file(string action)
{
        return __DIR__"miaojia-zhang/"+ action;
}
