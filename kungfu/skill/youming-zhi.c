// youming-zhi.c 幽冥指

#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N左手轻轻拨动，五指徐徐弹出拨，一式「元神出窍」，拂向$n全身经脉",
        "force" : 90,
        "dodge" : 5,
        "damage": 15,
        "lvl"   : 0,
        "weapon"      : "右手食指",
        "damage_type" : "刺伤",
        "skill_name"  : "元神出窍"
]),
([      "action": "$N俯身掠向$n，一式「鬼魅穿心」，化掌成指，汹涌袭向$n，正是其要脉所在",
        "force" : 140,
        "attack": 5,
        "parry" : 5,
        "dodge" : 5,
        "damage": 20,
        "lvl"   : 40,
        "weapon"      : "右手食指",
        "damage_type" : "刺伤",
        "skill_name"  : "鬼魅穿心"
]),
([      "action": "$N双手扭曲如灵蛇，一式「血鬼锁心」施出，左右并用，陡然插向$n的双目",
        "force" : 155,
        "attack": 10,
        "parry" : 7,
        "dodge" : 5,
        "damage": 30,
        "lvl"   : 40,
        "weapon"      : "左手中指",
        "damage_type" : "刺伤",
        "skill_name"  : "血鬼锁心"
]),
([      "action": "$N一式「炼狱鬼嚎」，左手抽回，右手前探，戟指点向$n的脑后脊髓",    
        "force" : 170,
        "attack": 20,
        "parry" : 11,
        "dodge" : 9,
        "damage": 40,
        "lvl"   : 60,
        "weapon"      : "左手食指",
        "damage_type" : "刺伤",
        "skill_name"  : "炼狱鬼嚎"
]),
([      "action": "$N使一式「孤魂驭魔」，身影变幻不定地掠至$n身后，猛地拍向$n左前胸",
        "force" : 190,
        "attack": 30,
        "parry" : 12,
        "dodge" : 10,
        "damage": 50,
        "lvl"   : 80,
        "weapon"      : "右手中指",
        "damage_type" : "刺伤",
        "skill_name"  : "孤魂驭魔"
]),
([      "action": "$N两臂大开大阖，一式「妖风袭体」，劲力透彻，顿时激出数道劲气逼向$n",
        "force" : 220,
        "attack": 40,
        "parry" : 21,
        "dodge" : 15,
        "damage": 55,
        "lvl"   : 100,
        "weapon"      : "无形指气",
        "damage_type" : "刺伤",
        "skill_name"  : "妖风袭体"
]),
});

string main_skill() { return "canhe-zhi"; }

int valid_enable(string usage) { return usage == "finger" ||  usage == "parry"; }

int valid_learn(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail("练幽冥指必须空手。\n");

        if ((int)me->query_skill("force") < 80)
                return notify_fail("你的内功火候不够，无法学幽冥指。\n");

        if ((int)me->query_skill("finger", 1) < 60)
                return notify_fail("你的基本指法火候不够，无法学幽冥指。\n");

        if ((int)me->query("max_neili") < 800)
                return notify_fail("你的内力太弱，无法练幽冥指。\n");

        if (me->query_skill("finger", 1) < me->query_skill("youming-zhi", 1))
                return notify_fail("你的基本指法太差，无法领会更高深的幽冥指。\n");

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
        level = (int)me->query_skill("youming-zhi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了，无法练幽冥指。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练幽冥指。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -51);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"youming-zhi/" + action;
}
