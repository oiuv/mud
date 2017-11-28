// hanwang-qingdao.c 韩王青刀

inherit SKILL;

mapping *action = ({
([      "action": "$N一招「青刀现影」，$w有如一条黑龙在$n的周身旋游，勿快勿慢，变化若神",
        "force" : 40,
        "attack": 10,
        "dodge" : -10,
        "parry" : 5,
        "lvl"   : 0,
        "damage": 5,
        "skill_name" : "青刀现影",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「万水千山」，左右腿一前一后，$w乱披风势向$n的$l斩去",
        "force" : 90,
        "attack": 20,
        "dodge" : -10,
        "parry" : 8,
        "damage": 5,
        "lvl"   : 10,
        "skill_name" : "万水千山",
        "damage_type" : "割伤"
]),
([      "action":  "$N纵身跃落，一招「横扫千军」，$w带着疾风呼的一声便向$n横扫过去",
        "force" : 110,
        "attack": 25,
        "dodge" : -5,
        "parry" : 12,
        "damage": 15,
        "lvl"   : 30,
        "skill_name" : "横扫千军",
        "damage_type" : "割伤"
]),
([      "action": "$N一招「指点江山」，$w大开大阖，左右并进，左一刀，右一刀向$n的两肩砍落",
        "force" : 130,
        "attack": 30,
        "dodge" : 5,
        "parry" : 15,
        "damage": 25,
        "lvl"   : 50,
        "skill_name" : "指点江山",
        "damage_type" : "割伤"
]),
([      "action": "$N手中$w自上而下，一招「飞瀑青影」，刀光流泻，如一片雪白瀑布砍向$n的头部",
        "force" : 160,
        "attack": 35,
        "dodge" : 10,
        "parry" : 25,
        "damage": 30,
        "lvl"   : 80,
        "skill_name" : "飞瀑青影",
        "damage_type" : "割伤"
]),
([      "action": "$N挥舞$w，使出一招「直捣黄龙」，上劈下撩，左挡右开，如千军万马般罩向$n",
        "force" : 180,
        "attack": 40,
        "dodge" : 15,
        "parry" : 32,
        "damage": 35,
        "lvl"   : 100,
        "skill_name" : "直捣黄龙",
        "damage_type" : "割伤"
]),
([      "action": "$N带得刀风劲疾，一招「一刀两断」，一个猛转身，连刀带人往$n的$l的劈去",
        "force" : 190,
        "attack": 45,
        "dodge" : 5,
        "parry" : 35,
        "damage": 50,
        "lvl"   : 120,
        "skill_name" : "一刀两断",
        "damage_type" : "割伤"
]),
([      "action": "$N向前一个弓步，一招「千军万马」，$w直直的劈出，一片流光般的刀影向$n的全身罩去",
        "force" : 220,
        "attack": 50,
        "dodge" : 20,
        "parry" : 45,
        "damage": 60,
        "lvl"   : 150,
        "skill_name" : "千军万马",
        "damage_type" : "割伤"
]),
});


int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 100)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 30)
                return notify_fail("你的内功火候不够。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("hanwang-qingdao", 1))
                return notify_fail("你的基本刀法水平有限，无法领会更高深的韩王青刀。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("hanwang-qingdao",1);
        for(i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力不够练韩王青刀。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练韩王青刀。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -58);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hanwang-qingdao/" + action;
}
