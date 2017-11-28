// qilian-zhi.c 祁连五绝指

#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N左手轻轻拨动，五指徐徐弹出拨，一式「绝经指」，拂向$n全身经脉",
        "force" : 90,
        "dodge" : 5,
        "damage": 15,
        "lvl"   : 0,
        "damage_type" : "点穴",
        "skill_name" : "绝经指"
]),
([      "action": "$N俯身掠向$n，一式「绝脉指」，化掌成指，汹涌袭向$n，正是其要脉所在",
        "force" : 140,
        "attack": 5,
        "parry" : 5,
        "dodge" : 5,
        "damage": 20,
        "lvl" : 40,
        "damage_type" : "点穴",
        "skill_name" : "绝脉指"
]),
([      "action": "$N双手扭曲如灵蛇，一式「绝目指」施出，左右并用，陡然插向$n的双目",
        "force" : 155,
        "attack": 10,
        "parry" : 7,
        "dodge" : 5,
        "damage": 30,
        "lvl"   : 40,
        "damage_type" : "点穴",
        "skill_name" : "绝目指"
]),
([      "action": "$N一式「绝髓指」，左手抽回，右手前探，戟指点向$n的脑后脊髓",    
        "force" : 170,
        "attack": 20,
        "parry" : 11,
        "dodge" : 9,
        "damage": 40,
        "lvl"   : 60,
        "damage_type" : "点穴",
        "skill_name" : "绝髓指"
]),
([      "action": "$N使一式「绝心指」，身影变幻不定地掠至$n身后，猛地拍向$n左前胸",
        "force" : 190,
        "attack": 30,
        "parry" : 12,
        "dodge" : 10,
        "damage": 50,
        "lvl"   : 80,
        "damage_type" : "点穴",
        "skill_name" : "绝心指"
]),
([      "action": "$N两臂大开大阖，一式「天地绝灭」，劲力透彻，顿时激出数道劲气逼向$n",
        "force" : 220,
        "attack": 40,
        "parry" : 21,
        "dodge" : 15,
        "damage": 55,
        "lvl"   : 100,
        "damage_type" : "点穴",
        "skill_name" : "天地绝灭"
]),
});

string main_skill() { return "canhe-zhi"; }

int valid_enable(string usage) { return usage == "finger" ||  usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练祁连五绝指必须空手。\n");

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学祁连五绝指。\n");

        if ((int)me->query_skill("finger", 1) < 40)
                return notify_fail("你的基本指法火候不够，无法学祁连五绝指。\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力太弱，无法练祁连五绝指。\n");

        if (me->query_skill("finger", 1) < me->query_skill("qilian-zhi", 1))
                return notify_fail("你的基本指法太差，无法领会更高深的祁连五绝指。\n");

        return 1;
}

string query_skill_name(int level)
{
        int i;
        for(i = sizeof(action) - 1; i >= 0; i--)
                if (level >= action[i]["lvl"])
                        return action[i]["skill_name"];
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int)me->query_skill("qilian-zhi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了，无法练祁连五绝指。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练祁连五绝指。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -51);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qilian-zhi/" + action;
}
