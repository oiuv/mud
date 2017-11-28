// jinshe-zhang.c

inherit SKILL;

mapping *action = ({
([      "skill_name": "千蛇出洞",
        "action": "$N双掌一错，一招「千蛇出洞」幻出漫天掌影拢向$n的$l",
        "force" : 240,
        "attack": 31,
        "dodge" : 30,
        "parry" : 10,
        "damage": 60,
        "damage_type": "瘀伤"
]),
([      "skill_name": "魔吼天地",
        "action": "$N暴喝一声，双掌连环推出，一招「大沼龙蛇」强劲的掌风直扑$n的$l",
        "force" : 240,
        "attack": 22,
        "dodge" : 30,
        "parry" : 10,
        "damage": 55,
        "damage_type": "瘀伤"
]),
([      "skill_name": "双蛇抢珠",
        "action": "$N双掌纷飞，一招「双蛇抢珠」直取$n的$l",
        "force" : 240,
        "attack": 29,
        "dodge" : 10,
        "parry" : 30,
        "damage": 45,
        "damage_type": "瘀伤"
]),
([      "skill_name": "游走式",
        "action": "$N提气缠身游走，一招「游走式」，森森掌风无孔不入般地击向$n的$l",
        "force" : 240,
        "attack": 30,
        "dodge" : 10,
        "parry" : 50,
        "damage": 70,
        "damage_type": "瘀伤"
]),
([      "skill_name": "盘身式",
        "action": "$N盘身错步，双掌平推，凝神聚气，一招「盘身式」拍向$n的$l",
        "force" : 210,
        "attack": 38,
        "dodge" : 30,
        "parry" : 70,
        "damage": 50,
        "damage_type": "瘀伤"
]),
([      "skill_name": "金蛇吐衅",
        "action": "$N左掌立于胸前，右掌推出，一招「金蛇吐衅」击向$n$l",
        "force" : 210,
        "attack": 32,
        "dodge" : 30,
        "parry" : 70,
        "damage": 51,
        "damage_type": "瘀伤"
]),
([      "skill_name": "金蛇翻身咬",
        "action": "$N使出「金蛇翻身咬」，身形凌空飞起，从空中当头向$n的$l出掌攻击",
        "force" : 210,
        "attack": 25,
        "dodge" : 30,
        "parry" : 70,
        "damage": 42,
        "damage_type": "瘀伤"
]),
([      "skill_name": "杯弓蛇影",
        "action": "$N使出一招「杯弓蛇影」，左掌化虚为实击向$n的$l",
        "force" : 210,
        "attack": 38,
        "dodge" : 30,
        "parry" : 70,
        "damage": 50,
        "damage_type": "瘀伤"
]),
([      "skill_name": "金蛇缠丝手",
        "action": "$N左掌画了个圈圈，右掌推出，一招「金蛇缠丝手」击向$n$l",
        "force" : 210,
        "attack": 28,
        "dodge" : 30,
        "parry" : 70,
        "damage": 53,
        "damage_type": "瘀伤"
]),
([      "skill_name": "灵蛇游八方",
        "action": "$N使出「灵蛇游八方」，身形散作八处同时向$n的$l出掌攻击",
        "force" : 210,
        "attack": 27,
        "dodge" : 30,
        "parry" : 70,
        "damage": 47,
        "damage_type": "瘀伤"
]),
([      "skill_name": "金蛇探头",
        "action": "$N使出金蛇游身掌法「金蛇探头」，如鬼魅般欺至$n身前，一掌拍向$n的$l",
        "force" : 210,
        "attack": 31,
        "dodge" : 30,
        "parry" : 70,
        "damage": 55,
        "damage_type": "瘀伤"
]),
([      "skill_name": "金龙升天",
        "action": "$N内气上提，全身拔起，一招「金龙升天」，双掌凌空拍下，$n的全身都被笼罩在掌力之下",
        "force" : 210,
        "attack": 35,
        "dodge" : 30,
        "parry" : 70,
        "damage": 45,
        "damage_type": "瘀伤"
]),
});

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力不足，无法练金蛇游身掌。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，无法练金蛇游身掌。\n");

	if ((int)me->query_skill("strike", 1) < (int)me->query_skill("jinshe-zhang", 1))
		return notify_fail("你的基本掌法水平有限，无法领会更高深的金蛇游身掌。\n");

        return 1;
}

int valid_enable(string usage) { return usage=="strike" || usage=="parry"; }

mapping query_action(object me, object weapon)
{
        return action[random(sizeof(action))];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 70 )
                return notify_fail("你的体力不够了，休息一下再练吧。\n");

        if( (int)me->query("neili") < 55 )
                return notify_fail("你的内力不够了，休息一下再练吧。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -53);
        return 1;
}

int effective_level() { return 10;}
 
string *parry_msg = ({
        "$n使出「粘」字诀，双掌一划，引偏了$N的$w。\n",
});

string *unarmed_parry_msg = ({
        "$n施展出金蛇游身掌，轻描淡写的化解了$N的攻势。\n",
});

string query_parry_msg(object weapon)
{
        if (weapon)
                return parry_msg[random(sizeof(parry_msg))];
        else
                return unarmed_parry_msg[random(sizeof(unarmed_parry_msg))];
}

string perform_action_file(string action)
{
        return __DIR__"jinshe-zhang/" + action;
}
