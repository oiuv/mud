//yinlong-bian.c 《九阴真经》——九阴神功——银龙鞭法
//Edit By Vin On 13/2/2001

#include <ansi.h>

inherit SKILL;

mapping *action = ({
([      "action": "$N端坐不动，一式「神蛟初现」，手腕力抬，$w滚动飞舞，宛如灵蛇乱颤扫向$n",
        "force" : 98,
        "attack": 41,
        "dodge" : -5,
        "parry" : 15,
        "damage": 32,
        "lvl"   : 0,
        "damage_type": "抽伤"
]),
([      "action": "$N一式「神蛟再现」，$w抖得笔直，“呲呲”破空声中向$n疾刺而去",
        "force" : 187,
        "attack": 48,
        "dodge" : -20,
        "parry" : 36,
        "damage": 47,
        "lvl"   : 80,
        "damage_type": "刺伤"
]),
([      "action": "$N内劲到处，将$w抖动转成两个圆圈，一式「神蛟又现」，从半空中往$n缠下",
        "force" : 231,
        "attack": 65,
        "dodge" : -10,
        "parry" : 55,
        "damage": 93,
        "lvl"   : 100,
        "damage_type": "抽伤"
]),
([      "action": "$N劲走螺旋，一式「吞天裂地势」，$w在$n眼前连变数种招式，忽然从$l处倒卷上来",
        "force" : 263,
        "attack": 70,
        "dodge" : 5,
        "parry" : 60,
        "damage": 102,
        "lvl"   : 120,
        "damage_type": "抽伤"
]),
([      "action": "$N一声高喝，使出「真天罗势」，$w急速转动，鞭影纵横，似真似幻，绞向$n",
        "force" : 301,
        "attack": 77,
        "dodge" : 6,
        "parry" : 65,
        "damage": 121,
        "lvl"   : 140,
        "damage_type": "抽伤"
]),
([      "action": "$N含胸拔背，一式「六道轮回势」，力道灵动威猛，劲力从四面八方向$n挤压出去",
        "force" : 331,
        "attack": 85,
        "dodge" : 12,
        "parry" : 70,
        "damage": 142,
        "lvl"   : 160,
        "damage_type": "抽伤"
]),
([      "action":"$N力贯鞭梢，一招「大吉祥势」，手中$w舞出满天鞭影，排山倒海般扫向$n",
        "force" : 373,
        "attack": 91,
        "dodge" : 17,
        "parry" : 75,
        "damage": 163,
        "lvl"   : 180,
        "damage_type": "抽伤"
]),
([      "action":"$N力贯鞭梢，一招「龙飞十二重天势」，手中$w舞出满天鞭影，排山倒海般扫向$n",
        "force" : 401,
        "attack": 98,
        "dodge" : 20,
        "parry" : 85,
        "damage": 189,
        "lvl"   : 200,
        "damage_type": "抽伤"
]),
});

//string main_skill() { return "jiuyin-shengong"; }

int valid_enable(string usage) { return usage == "whip" || usage == "parry"; }

int valid_learn(object me)
{
        object weapon;

        //if ((int)me->query_skill("jiuyin-shengong", 1))
                //return notify_fail("你已将九阴真经上的武功全部融会贯通，不必再分开学习了。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你必须先找一条鞭子才能练银龙鞭法。\n");

        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力不足，没有办法练银龙鞭法。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的内功火候太浅，没有办法练银龙鞭法。\n");

        if ((int)me->query_skill("whip", 1) < 100)
                return notify_fail("你的基本鞭法火候太浅，没有办法练银龙鞭法。\n");

        if ((int)me->query_skill("whip", 1) < (int)me->query_skill("yinlong-bian", 1))
                return notify_fail("你的基本鞭法水平还不够，无法领会更高深的银龙鞭法。\n");

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
        level = (int) me->query_skill("yinlong-bian",1);
        for(i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if ((int)me->query_skill("jiuyin-shengong", 1))
                return notify_fail("你已将九阴真经上的武功全部融会贯通，不必再分开练习了。\n");

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "whip")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 100)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 350)
                return notify_fail("你的内力不够。\n");

        me->receive_damage("qi", 80);
        me->add("neili", -300);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"yinlong-bian/" + action;
}
