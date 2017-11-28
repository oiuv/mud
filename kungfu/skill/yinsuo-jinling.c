#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N端坐不动，一招「对台梳妆」，手中$w抖得笔直，对准$n$l直刺而去",
        "force" : 80,
        "attack": 30,
        "dodge" : 35,
        "parry" : 25,
        "damage": 30,
        "lvl"   : 0,
        "skill_name" : "对台梳妆",
        "damage_type": "刺伤"
]),
([      "action": "$N身形一转，一招「云龙白鹤」，手中$w如矫龙般腾空一卷，猛地向$n劈头打下",
        "force" : 130,
        "attack": 38,
        "dodge" : 43,
        "parry" : 27,
        "damage": 45,
        "lvl"   : 40,
        "skill_name" : "云龙白鹤",
        "damage_type": "抽伤"
]),
([      "action": "$N力贯鞭梢，一招「明月千里」，手中$w舞出满天鞭影，铺天盖地袭向$n全身",
        "force" : 160,
        "attack": 45,
        "dodge" : 63,
        "parry" : 29,
        "damage": 61,
        "lvl"   : 80,
        "skill_name" : "明月千里",
        "damage_type": "抽伤"
]),
([      "action":"$N一声娇喝，一招「映月无声」，手中$w变换莫测，从意想不到的方位扫向$n",
        "force" : 180,
        "attack": 50,
        "dodge" : 65,
        "parry" : 33,
        "damage": 68,
        "lvl"   : 120,
        "skill_name" : "映月无声",
        "damage_type": "抽伤"
]),
([      "action":"$N飞身一跃而起，凌空一招「影玉徵辉」，$w宛如蛟龙通天，携着飕飕破空之声袭向$n",
        "force" : 210,
        "attack": 53,
        "dodge" : 76,
        "parry" : 36,
        "damage": 73,
        "lvl"   : 160,
        "skill_name" : "影玉徵辉",
        "damage_type": "抽伤"
]),
([      "action":"$N身形飘逸无定，一招「金光泻地」，手中$w幻出无数鞭影，笼罩$n全身",
        "force" : 230,
        "attack": 65,
        "dodge" : 92,
        "parry" : 35,
        "damage": 91,
        "lvl"   : 180,
        "skill_name":  "金光泻地",
        "damage_type": "抽伤"
]),
([      "action":"$N身形飘逸无定，一招「蜃楼银沙」，手中$w幻出无数鞭影，笼罩$n全身",
        "force" : 251,
        "attack": 66,
        "dodge" : 117,
        "parry" : 40,
        "damage": 120,
        "lvl"   : 200,
        "skill_name" : "蜃楼银沙",
        "damage_type": "抽伤"
]),
});

int valid_enable(string usage) 
{ 
        return usage == "whip" || usage == "parry"; 
}

int valid_learn(object me)
{
        object weapon;

        if (me->query("gender") != "女性")
                return notify_fail("银索金铃只有女性能练。\n");

        if ((int)me->query("dex", 1) < 28)
                return notify_fail("你的先天身法不够，无法练银索金铃。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你必须先找一条鞭子才能练银索金铃。\n");

        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力不足，没有办法练银索金铃。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候太浅，没有办法练银索金铃。\n");

        if ((int)me->query_skill("whip", 1) < 30)
                return notify_fail("你的基本鞭法火候太浅，没有办法练银索金铃。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("yinsuo-jinling", 1))
                return notify_fail("你的基本鞭法水平还不够，无法领会更高深的银索金铃。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("yinsuo-jinling", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练银索金铃。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练银索金铃。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -55);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yinsuo-jinling/" + action;
}
