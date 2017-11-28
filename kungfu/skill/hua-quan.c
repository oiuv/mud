inherit SKILL;

mapping *action = ({
([      "action": "只见$N身形一矮，大喝声中一个「斜身拦门插铁闩」对准$n呼地砸去",
        "force" : 60,
        "attack": 20,
        "dodge" : 40,
        "parry" : 5,
        "damage": 4,
        "lvl"   : 0,
        "skill_name" : "斜身拦门插铁闩",
        "damage_type":  "砸伤"
]),
([      "action": "$N左手一分，右拳运气，一招「晓星当头即走拳」便往$n的$l招呼过去",
        "force" : 80,
        "attack": 25,
        "dodge" : 43,
        "parry" : 6,
        "damage": 7,
        "lvl"   : 30,
        "skill_name" : "晓星当头即走拳",
        "damage_type":  "瘀伤"
]),
([      "action": "$N右拳在$n面门一晃，左掌使了个「出势跨虎西岳传」往$n狠命一拳",
        "force" : 100,
        "attack": 28,
        "dodge" : 45,
        "parry" : 8,
        "damage": 10,
        "lvl"   : 60,
        "skill_name" : "出势跨虎西岳传",
        "damage_type":  "抓伤"
]),
([      "action": "$N左拳拉开，右拳带风，一招「金鹏展翅庭中站」势不可挡地击向$n",
        "force" : 120,
        "attack": 35,
        "dodge" : 47,
        "parry" : 11,
        "damage": 17,
        "lvl"   : 80,
        "skill_name" : "金鹏展翅庭中站",
        "damage_type":  "瘀伤"
]),
([      "action": "只见$N拉开架式，一招「韦陀献抱在胸前」使出，底下却飞踢$n的$l",
        "force" : 140,
        "attack": 40,
        "dodge" : 49,
        "parry" : 13,
        "damage": 20,
        "lvl"   : 100,
        "skill_name" : "韦陀献抱在胸前",
        "damage_type":  "瘀伤"
]),
([      "action": "$N左手往$n身后一抄，一招「把臂拦门横铁闩」便往$n面门砸去",
        "force" : 160,
        "attack": 45,
        "dodge" : 52,
        "parry" : 16,
        "damage": 22,
        "lvl"   : 120,
        "skill_name" : "把臂拦门横铁闩",
        "damage_type":  "砸伤"
]),
([      "action": "$N拉开后弓步，双掌使了个「魁鬼仰斗撩绿栏」往$n的$l狠力一推",
        "force" : 200,
        "attack": 48,
        "dodge" : 54,
        "parry" : 18,
        "damage": 28,
        "lvl"   : 140,
        "skill_name" : "魁鬼仰斗撩绿栏",
        "damage_type":  "瘀伤"
]),
([      "action": "只见$N运足气力使出「出势跨虎西岳传」，连攻数拳，全部击向$n的$l",
        "force" : 220,
        "attack": 51,
        "dodge" : 57,
        "parry" : 20,
        "damage": 32,
        "lvl"   : 160,
        "skill_name" : "出势跨虎西岳传",
        "damage_type":  "瘀伤"
]),
([      "action": "$N往后一纵，就势使了个「白猿偷桃拜天庭」，右腿扫向$n的$l",
        "force" : 260,
        "attack": 55,
        "dodge" : 61,
        "parry" : 21,
        "damage": 35,
        "lvl"   : 180,
        "skill_name" : "白猿偷桃拜天庭",
        "damage_type":  "砸伤"
]),
([      "action": "$N一个转身，左掌护胸，右掌反手使了个「吴王试剑劈玉砖」往$n当头劈落",
        "force" : 280,
        "attack": 60,
        "dodge" : 63,
        "parry" : 23,
        "damage": 37,
        "lvl"   : 200,
        "skill_name" : "吴王试剑劈玉砖",
        "damage_type":  "砸伤"
]),
([      "action": "$N飞身跃起，一招「撤身倒步一溜烟」，脚踢$n面门，随即双拳已到$n$l",
        "force" : 300,
        "attack": 62,
        "dodge" : 65,
        "parry" : 25,
        "damage": 40,
        "lvl"   : 220,
        "skill_name" : "撤身倒步一溜烟",
        "damage_type":  "瘀伤"
]),
});

int valid_enable(string usage)
{
        return usage == "cuff" || usage == "parry";
}

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练西岳华拳必须空手。\n");

        if (me->query("max_neili") < 200)
                return notify_fail("你的内力不够，无法练习西岳华拳。\n");

        if ((int)me->query_skill("cuff", 1) < 40)
                return notify_fail("你的基本拳法火候太浅。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("hua-quan", 1))
                return notify_fail("你的基本拳法火候有限，无法领会更高深的西岳华拳。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for (i = sizeof(action)-1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("hua-quan", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够练习西岳华拳。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -40);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hua-quan/" + action;
}
