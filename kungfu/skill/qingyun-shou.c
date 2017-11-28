inherit SKILL;

mapping *action = ({
([	"action" : "$N跨前一步，一式「寒月初升」，单手一拂而过，拍向$n的$l",
        "force" : 70,
        "attack": 5,
        "dodge" : 38,
        "parry" : 38,
        "damage": 1,
        "lvl"   : 0,
        "skill_name" : "寒月初升",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N一式「云雾茫茫」，双手缤纷拍出，同时击向$n的胸前几大要穴",
        "force" : 95,
        "attack": 8,
        "dodge" : 43,
        "parry" : 43,
        "damage": 4,
        "lvl"   : 20,
        "skill_name" : "云雾茫茫",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N使一式「天际排云」，双掌纷飞，连续拍出，掌影向$n层层推进",
        "force" : 120,
        "attack": 13,
        "dodge" : 51,
        "parry" : 51,
        "damage": 8,
        "lvl"   : 40,
        "skill_name" : "天际排云",
        "damage_type" : "瘀伤"
]),
([	"action" : "$N一式「平步青云」，单手一挥，手影虚虚实实，难辨真伪，完全笼罩$n",
        "force" : 140,
        "attack": 15,
        "dodge" : 65,
        "parry" : 65,
        "damage": 12,
        "lvl"   : 60,
        "skill_name" : "平步青云",
        "damage_type" : "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "hand" ||  usage == "parry"; }

int valid_combine(string combo) { return combo=="panyang-zhang"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练青云手必须空手。\n");

        if (me->query_skill("force") < 20)
                return notify_fail("你的内功火候不够，不能练青云手。\n");

        if (me->query("max_neili") < 50)
                return notify_fail("你的内力太弱，无法练青云手。\n");

        if (me->query_skill("hand", 1) < me->query_skill("qingyun-shou", 1))
                return notify_fail("你的基本手法太差，无法领会更高深的青云手。\n");

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
        level   = (int)me->query_skill("qingyun-shou", 1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练习青云手。\n");

        if (me->query_skill("qingyun-shou", 1) < 100)
                me->receive_damage("qi", 20);
        else
                me->receive_damage("qi", 30);

        me->add("neili", -40);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qingyun-shou/"+ action;
}
