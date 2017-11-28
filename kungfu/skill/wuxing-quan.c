#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action" : "$N右脚立定、左脚虚点，一式" HIR "『赤火手』" NOR "，左右手一高一低，击向$n的$l",
        "force" : 150,
        "dodge" : 5,
        "damage": 5,
        "lvl" : 0,
        "skill_name" : "赤火手",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左脚虚踏，全身右转，一招" HIW "『行风腿』" NOR "，右腿携着旋风劲猛地踢向$n的$l",
        "force" : 200,
        "dodge" : 10,
        "damage": 20,
        "lvl" : 20,
        "skill_name" : "行风腿",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N身形飘忽不定，猛然一招" HIC "『水龙抓』" NOR "连环击出，无数爪影一齐抓向$n的$l",
        "force" : 200,
        "dodge" : 10,
        "damage": 20,
        "lvl" : 40,
        "skill_name" : "水龙抓",
        "damage_type" : "抓伤"
]),
([      "action" : "$N双手大开大阖，宽打高举，使一招" HIY "『烁金掌』" NOR "，双掌变做两道金光罩向$n$l",
        "force" : 220,
        "dodge" : 15,
        "damage": 25,
        "lvl" : 60,
        "skill_name" : "烁金掌",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N左掌圈花扬起，屈肘当胸，右手虎口朝上，一招" WHT "『土霸拳』" NOR "呼啸着打向$n的$l",
        "force" : 260,
        "dodge" : 20,
        "damage": 35,
        "lvl" : 80,
        "skill_name" : "土霸拳",
        "damage_type" : "瘀伤"
]),
([      "action" : "$N凝神聚气，一招" YEL "『神木指』" NOR "，上身前探，“飕”地一指直刺$n的$l",
        "force" : 300,
        "dodge" : 25,
        "damage": 30,
        "lvl" : 100,
        "weapon" : "手指",
        "skill_name" : "神木指",
        "damage_type" : "刺伤"
]),
([      "action" : "$N双拳划弧，一记" RED "『五行总诀』" NOR "，招出如电，幻出漫天掌影，铺天盖地袭向$n全身",
        "force" : 320,
        "dodge" : 0,
        "damage": 40,
        "lvl" : 120,
        "skill_name" : "五行总诀",
        "damage_type" : "内伤"
]),
});

int valid_enable(string usage) { return usage=="unarmed" || usage=="parry"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练五行拳必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学五行拳。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力太弱，无法练五行拳。\n");

        if ((int)me->query_skill("unarmed", 1) < 100)
                return notify_fail("你的拳脚根基有限，无法体会五行拳要诣。\n");

        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("wuxing-quan", 1))
                return notify_fail("你的拳脚根基火候不足，无法领会更高深的五行拳。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action)-1; i >= 0; i--)
                if(level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level   = (int) me->query_skill("wuxing-quan",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力太低了。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够练五行拳。\n");

        me->receive_damage("qi", 45);
        me->add("neili", -56);

        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"wuxing-quan/" + action;
}
