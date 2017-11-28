inherit SKILL;

mapping *action = ({
([      "action": "只见$N飞身一纵，一招「燕子渡水」凌空一拳打向$n的$l",
        "dodge": 15,
        "parry": 15,
        "attack": 20,
        "force": 120,
        "damage_type":  "砸伤"
]),
([      "action": "$N步履一沉，左拳拉开，右拳带风，一招「燕尾手」势不可挡地击向$n$l",
        "dodge": 25,
        "parry": 25,
        "attack": 30,
        "force": 140,
        "damage_type":  "瘀伤"
]),
([      "action": "只见$N拉开架式，一招「掠水掌」使得虎虎有风。底下却飞起一脚踢向$n$l",
        "dodge": 20,
        "parry": 20,
        "attack": 25,
        "force": 160,
        "damage_type":  "瘀伤"
]),
([      "action": "$N一个转身，左掌护胸，右掌使了个「百花齐放」往$n当头一拳",
        "dodge": 30,
        "parry": 30,
        "attack": 40,
        "force": 270,
        "damage_type":  "砸伤"
]),
([      "action": "只见$N拉开架式，一招「平推掌」使得虎虎有风，数只手掌一齐击向$n的$l",
        "dodge": 20,
        "parry": 20,
        "attack": 25,
        "force": 160,
        "damage_type":  "瘀伤"
]),
([      "action": "$N一个转身，左掌护胸，右掌使了个「燕青逸翔」往$n当头拂过",
        "dodge": 30,
        "parry": 30,
        "attack": 40,
        "force": 270,
        "damage_type":  "砸伤"
]),
});

string main_skill() { return "baihua-cuoquan"; }

int valid_learn(object me)
{
        if (me->query_skill("baihua-cuoquan", 1) > 0)
                return notify_fail("你已经练成了百花错拳，不必再单独学习了。\n");

        if( me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练燕青拳必须空手。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("yanqing-quan", 1))
                return notify_fail("你的基本拳脚火候不足，无法领会更高深的燕青拳。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("yanqing-quan", 1))
                return notify_fail("你的拳法根基火候不足，无法领会更高深的燕青拳。\n");

        return 1;
}

int valid_enable(string usage)
{
        return usage == "cuff" || usage=="unarmed" || usage=="parry";
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
        return __DIR__"yanqing-quan/" + action;
}
