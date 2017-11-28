inherit SKILL;

mapping *action = ({
([      "action": "$N一招「苍松迎客」，单掌平推，拍向$n的$l",
        "force" : 10,
        "dodge" : 5,
        "parry" : 2,
        "lvl"   : 0,
        "skill_name" : "苍松迎客",
        "damage_type": "瘀伤"
]),
([      "action": "$N使一招「峰回路转」，右手划了一个圈子，左手挥出，劈向$n的$l",
        "force" : 15,
        "dodge" : 18,
        "parry" : 17,
        "lvl"   : 10,
        "skill_name" : "峰回路转",
        "damage_type": "瘀伤"
]),
([      "action": "$N右手由钩变掌，使一招「奇峰突现」，横扫$n的$l",
        "force" : 15,
        "dodge" : 16,
        "parry" : 19,
        "lvl"   : 20,
        "skill_name" : "奇峰突现",
        "damage_type": "瘀伤"
]),
([      "action": "$N双手划弧，右手向上，左手向下，使一招「白鹤亮翅」，分击$n的面门和$l",
        "force" : 25,
        "dodge" : 24,
        "parry" : 21,
        "lvl"   : 30,
        "skill_name" : "白鹤亮翅",
        "damage_type": "瘀伤"
]),
([      "action": "$N左手划了一个大圈，使一招「五行柳变」，击向$n的$l",
        "force" : 25,
        "dodge" : 24,
        "parry" : 28,
        "lvl"   : 40,
        "skill_name" : "五行柳变",
        "damage_type": "瘀伤"
]),
([      "action": "$N双手合掌，使一招「灵猴采桃」，双掌分别向$n的$l打去",
        "force" : 30,
        "dodge" : 28,
        "parry" : 30,
        "lvl"   : 50,
        "skill_name" : "灵猴采桃",
        "damage_type": "瘀伤"
]),
([      "action": "$N左手横于胸前，右掌直击$n的$l，正是一招「仙人指路」",
        "force" : 35,
        "dodge" : 24,
        "parry" : 21,
        "lvl"   : 60,
        "skill_name" : "仙人指路",
        "damage_type": "瘀伤"
]),
([      "action": "$N左脚前踏半步，双掌猛然齐出,一招「釜底抽薪」，向$n的$l拍去",
        "force" : 35,
        "dodge" : 26,
        "parry" : 25,
        "lvl"   : 70,
        "skill_name" : "釜底抽薪",
        "damage_type": "瘀伤"
]),
([      "action": "$N双手翻飞，化作无数掌影，一招「漫天花舞」，直逼$n",
        "force" : 20,
        "dodge" : 28,
        "parry" : 15,
        "lvl"   : 80,
        "skill_name" : "漫天花舞",
        "damage_type": "瘀伤"
]),
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; }

int valid_combine(string combo)
{
        return combo == "taiji-quan" || combo == "paiyun-shou";
}

string main_skill() { return "baihua-cuoquan"; }

int valid_learn(object me)
{
        if (me->query_skill("baihua-cuoquan", 1) > 0)
                return notify_fail("你已经练成了百花错拳，不必再单独学习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练武当掌法必须空手。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够，无法学武当掌法。\n");

        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力太弱，无法练武当掌法。\n");

        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("wudang-zhang", 1))
                return notify_fail("你的基本掌法火候不足，无法领会更高深的武当掌法。\n");

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
        level = (int) me->query_skill("wudang-zhang", 1);
        for (i = sizeof(action); i > 0; i--)
            if (level > action[i-1]["lvl"])
                return action[NewRandom(i, 5, level / 5)];
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
        return __DIR__"wudang-zhang/" + action;
}
