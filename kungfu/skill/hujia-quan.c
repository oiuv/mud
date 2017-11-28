inherit SKILL;

mapping *action = ({
([      "action": "只见$N身形一矮，大喝声中一个「冲天炮」对准$n的鼻子呼地砸去",
        "force" : 60,
        "attack": 20,
        "dodge" : 40,
        "parry" : 5,
        "damage": 4,
        "lvl"   : 0,
        "skill_name" : "冲天炮",
        "damage_type":  "砸伤"
]),
([      "action": "$N左手一分，右拳运气，一招「拔草寻蛇」便往$n的$l招呼过去",
        "force" : 80,
        "attack": 25,
        "dodge" : 43,
        "parry" : 6,
        "damage": 7,
        "lvl"   : 30,
        "skill_name" : "拔草寻蛇",
        "damage_type":  "瘀伤"
]),
([      "action": "$N右拳在$n面门一晃，左掌使了个「叶底偷桃」往$n的$l狠命一抓",
        "force" : 100,
        "attack": 28,
        "dodge" : 45,
        "parry" : 8,
        "damage": 10,
        "lvl"   : 60,
        "skill_name" : "叶底偷桃",
        "damage_type":  "抓伤"
]),
([      "action": "$N左拳拉开，右拳带风，一招「黑虎掏心」势不可挡地击向$n$l",
        "force" : 120,
        "attack": 35,
        "dodge" : 47,
        "parry" : 11,
        "damage": 17,
        "lvl"   : 80,
        "skill_name" : "黑虎掏心",
        "damage_type":  "瘀伤"
]),
([      "action": "只见$N拉开架式，一招「双风贯耳」使出，底下却飞起一脚踢向$n$l",
        "force" : 140,
        "attack": 40,
        "dodge" : 49,
        "parry" : 13,
        "damage": 20,
        "lvl"   : 100,
        "skill_name" : "双风贯耳",
        "damage_type":  "瘀伤"
]),
([      "action": "$N大喝一声，左手往$n身后一抄，右拳便往$n面门砸了过去",
        "force" : 160,
        "attack": 45,
        "dodge" : 52,
        "parry" : 16,
        "damage": 22,
        "lvl"   : 120,
        "skill_name" : "龙虎相交",
        "damage_type":  "砸伤"
]),
([      "action": "$N拉开后弓步，双掌使了个「如封似闭」往$n的$l一推",
        "force" : 200,
        "attack": 48,
        "dodge" : 54,
        "parry" : 18,
        "damage": 28,
        "lvl"   : 140,
        "skill_name" : "如封似闭",
        "damage_type":  "瘀伤"
]),
([      "action": "只见$N运足气力，一连三拳击向$n$l，力道一拳高过一拳",
        "force" : 220,
        "attack": 51,
        "dodge" : 57,
        "parry" : 20,
        "damage": 32,
        "lvl"   : 160,
        "skill_name" : "阳关三叠",
        "damage_type":  "瘀伤"
]),
([      "action": "$N往后一纵，就势使了个「老树盘根」，右腿扫向$n的$l",
        "force" : 260,
        "attack": 55,
        "dodge" : 61,
        "parry" : 21,
        "damage": 35,
        "lvl"   : 180,
        "skill_name" : "老树盘根",
        "damage_type":  "砸伤"
]),
([      "action": "$N一个转身，左掌护胸，右掌反手使了个「独劈华山」往$n当头一劈",
        "force" : 280,
        "attack": 60,
        "dodge" : 63,
        "parry" : 23,
        "damage": 37,
        "lvl"   : 200,
        "skill_name" : "独劈华山",
        "damage_type":  "砸伤"
]),
([      "action": "$N飞身跃起，一招「苍鹰捕鼠」，脚踢$n面门，随即双拳已到$n的$l",
        "force" : 300,
        "attack": 62,
        "dodge" : 65,
        "parry" : 25,
        "damage": 40,
        "lvl"   : 220,
        "skill_name" : "",
        "damage_type":  "瘀伤"
]),
});

int valid_enable(string usage)
{
        return usage == "cuff" || usage == "parry";
}

int valid_combine(string combo) { return combo == "chuncan-zhang"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练胡家拳必须空手。\n");

        if (me->query("max_neili") < 100)
                return notify_fail("你的内力不够，无法练习胡家拳法。\n");

        if ((int)me->query_skill("cuff", 1) < 20)
                return notify_fail("你的基本拳法火候太浅。\n");

        if ((int)me->query_skill("cuff", 1) < (int)me->query_skill("hujia-quan", 1))
                return notify_fail("你的基本拳法火候有限，无法领会更高深的胡家拳法。\n");

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
        level = (int)me->query_skill("hujia-quan", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70 )
                return notify_fail("你现在手足酸软，休息一下再练吧。\n");

        if ((int)me->query("neili") < 60)
                return notify_fail("你的内力不够了。\n");

        me->receive_damage("qi", 65);
        me->add("neili", -40);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"hujia-quan/" + action;
}
