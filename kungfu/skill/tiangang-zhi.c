#include <ansi.h>
inherit SKILL;

mapping *action = ({
([      "action": "$N左手轻轻拨动，右手五指徐徐弹出拨，一式「浪起湖心」，"
                  "拂向$n的$l",
        "force" : 90,
        "dodge" : 5,
        "damage": 15,
        "lvl"   : 0,
        "damage_type" : "瘀伤",
        "skill_name" : "浪起湖心"
]),
([      "action": "$N双手上下起落，俯身掠向$n，一式「瀑落清潭」，左手化掌成指，"
                  "汹涌袭向$n的$l",
        "force" : 140,
        "attack": 5,
        "parry" : 5,
        "dodge" : 5,
        "damage": 20,
        "lvl" : 40,
        "damage_type" : "瘀伤",
        "skill_name" : "瀑落清潭"
]),
([      "action": "$N左手由拳变掌，右手扭曲如灵蛇，一式「龟蛇竞渡」，左右并用，"
                  "拍向$n的$l",
        "force" : 170,
        "attack": 10,
        "parry" : 10,
        "dodge" : 15,
        "damage": 30,
        "lvl"   : 60,
        "damage_type" : "内伤",
        "skill_name" : "龟蛇竞渡"
]),
([      "action": "$N一式「倒索攀山」，左手抽回，右手前探，戟指点向$n的$l",    
        "force" : 190,
        "attack": 20,
        "parry" : 15,
        "dodge" : 25,
        "damage": 40,
        "lvl"   : 80,
        "damage_type" : "瘀伤",
        "skill_name" : "倒索攀山"
]),
([      "action": "$N使一式「闪现雷鸣」，身影变幻不定地掠至$n身后，猛地拍向$n的$l",
        "force" : 220,
        "attack": 30,
        "parry" : 20,
        "dodge" : 30,
        "damage": 50,
        "lvl"   : 100,
        "damage_type" : "瘀伤",
        "skill_name" : "闪现雷鸣"
]),
([      "action": "$N两臂大开大阖，吸一口气，一式「地动山摇」，劲力透彻，双手快"
                  "速一拨，激出数道劲气逼向$n的$l",
        "force" : 270,
        "attack": 40,
        "parry" : 25,
        "dodge" : 45,
        "damage": 55,
        "lvl"   : 120,
        "damage_type" : "瘀伤",
        "skill_name" : "地动山摇"
]),
([      "action": "$N身形纵起，衣袂飘荡，双手轻轻拍动，一式「水拍云崖」，居高临"
                  "下，连绵不绝拍向$n的$l",
        "force" : 300,
        "attack": 50,
        "parry" : 20,
        "dodge" : 50,
        "damage": 60,
        "lvl"   : 140,
        "damage_type" : "内伤",
        "skill_name" : "水拍云崖"
]),
([      "action": "$N腾空而起，双掌合一，十指如钩，一招「泰山压顶」，疾向$n的击"
                  "落，势道凶猛已极",
        "force" : 320,
        "attack": 60,
        "parry" : 25,
        "dodge" : 55,
        "damage": 70,
        "lvl"   : 160,
        "damage_type" : "内伤",
        "skill_name" : "泰山压顶"
])
});

int valid_enable(string usage) { return usage == "finger" ||  usage == "parry"; }

int valid_combine(string combo) { return combo == "jinding-zhang" || combo == "jieshou-jiushi"; }

int valid_learn(object me)
{
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon"))
                return notify_fail(HIC"练天罡指穴法必须空手。\n"NOR);

        if ((int)me->query_skill("force") < 100)
                return notify_fail("你的内功火候不够，无法学天罡指穴法。\n");

        if ((int)me->query("max_neili") < 500)
                return notify_fail("你的内力太弱，无法练天罡指穴法。\n");

        if (me->query_skill("finger", 1) < me->query_skill("tiangang-zhi", 1))
                return notify_fail("你的基本指法太差，无法领会更高深的天罡指穴法。\n");

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
        level = (int)me->query_skill("tiangang-zhi", 1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        if ((int)me->query("qi") < 70)
                return notify_fail("你的体力太低了，无法练天罡指穴法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练天罡指穴法。\n");

        me->receive_damage("qi", 55);
        me->add("neili", -51);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"tiangang-zhi/" + action;
}
