// feifeng-whip.c 飞凤鞭法

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N向上跃起，一招「凤凰展翅」，手中$w自下而上，击向$n的脸颊",
        "force" : 100,
        "dodge" : 0,
        "damage": 20,
        "lvl"   : 15,
        "skill_name" : "凤凰展翅",
        "damage_type":  "刮伤"
]),
([      "action": "$N一招「彩凤栖梧」，手中$w直绕向$n的$l",
        "force" : 110,
        "dodge" : -10,
        "damage": 30,
        "lvl"   : 20,
        "skill_name" : "彩凤栖梧",
        "damage_type":  "内伤"
]),
([      "action": "$N一招「鸾凤和鸣」，手中$w腾空一卷，一声脆响入磬，猛地向$n劈头打下",
        "force" : 120,
        "dodge" : -15,
        "damage": 40,
        "lvl"   : 40,
        "skill_name" : "鸾凤和鸣",
        "damage_type":  "劈伤"
]),
([      "action": "$N踏上一步，冲着$n轻佻一笑，手中$w却毫不停留，一招「游龙戏凤」，"
                  "扫向$n的$l",
        "force" : 130,
        "dodge" : -30,
        "damage": 60,
        "lvl"   : 50,
        "skill_name" : "游龙戏凤",
        "damage_type":  "刺伤"
]),
([      "action": "$N跃在半空，一招「龙飞凤舞」，手中$w如游龙洗空，长凤戏羽，"
                  "乱雨倾盆般分点$n左右",
        "force" : 150,
        "dodge" : -35,
        "damage": 70,
        "lvl"   : 60,
        "skill_name" : "龙飞凤舞",
        "damage_type":  "刺伤"
]),
([      "action": "$N向前急进，手中$w圈转如虹，一招「龙凤呈祥」，罩向$n前胸",
        "force" : 170,
        "dodge" : -40,
        "damage": 85,
        "lvl"   : 75,
        "skill_name" : "龙凤呈祥",
        "damage_type":  "内伤"
])
});

int valid_enable(string usage) { return usage == "whip" || usage == "parry"; }

int valid_learn(object me)
{
        object weapon;

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候太浅。\n");

        if (me->query("gender") != "女性")
                return notify_fail("大老爷们学这飞凤鞭？天资不足吧。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你必须先找一条长鞭才能练鞭法。\n");

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

        level = (int) me->query_skill("feifeng-whip", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i - 1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练飞凤鞭法。\n");

        if ((int)me->query("neili") < 20)
                return notify_fail("你的内力不够练飞凤鞭法。\n");

        me->receive_damage("qi", -12);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"feifeng-whip/" + action;
}
