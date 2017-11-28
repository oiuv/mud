inherit SKILL;

mapping *action = ({
([      "action": "在呼呼风声中，$N飞身一跃，双手如钩如戢，插向$n的$l",
        "force" : 60,
        "dodge" : 17,
        "parry" : 1,
        "damage": 1,
        "damage_type" : "抓伤"
]),
([      "action": "$N身形一跃，飞身扑上，右手直直抓向$n的$l",
        "force" : 80,
        "dodge" : 20,
        "parry" : 5,
        "damage": 3,
        "damage_type" : "抓伤"
]),
([      "action": "$N双手平伸，十指微微上下抖动，双手齐抓向$n的$l",    
        "force" : 120,
        "dodge" : 32,
        "parry" : 10,
        "damage": 5,
        "damage_type" : "抓伤"
]),
([      "action": "$N悄无声息的游走至$n身前，猛的一爪奋力抓向$n的$l",
        "force" : 132,
        "dodge" : 38,
        "parry" : 19,
        "damage": 5,
        "damage_type" : "抓伤"
]),
});

string main_skill() { return "baihua-cuoquan"; }

int valid_learn(object me)
{
        if (me->query_skill("baihua-cuoquan", 1) > 0)
                return notify_fail("你已经练成了百花错拳，不必再单独学习了。\n");

        if( me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练小擒拿手必须空手。\n");

        if ((int)me->query_skill("claw", 1) < (int)me->query_skill("xiao-qinna", 1))
                return notify_fail("你的基本爪法火候不足，无法领会更高深的小擒拿手。\n");

        return 1;
}

int valid_enable(string usage)
{
        return usage == "claw" || usage=="parry";
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
        if( (int)me->query("qi") < 100 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if( (int)me->query("neili") < 80 )
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -50);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"xiao-qinna/" + action;
}
