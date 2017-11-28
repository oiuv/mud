#include <ansi.h>
inherit SKILL;
 
mapping *action = ({
([      "action": "$N身形稍退，手中$w迎风一抖，朝着$n劈头盖脸地砸将下",
        "dodge" : 31,
        "attack": 31,
        "force" : 289,
        "damage": 34,
        "parry" : 35,
        "lvl" : 0,
        "damage_type": "砸伤"
]),
([      "action": "$N仰天长笑，看也不看，随手一棒向$n当头砸下",
        "dodge" : 33,
        "attack": 37,
        "force" : 316,
        "damage": 41,
        "parry" : 42,
        "lvl" : 25,
        "damage_type": "砸伤"
]),
([      "action": "$N一个虎跳，越过$n头顶，手中$w抡个大圆，砸向$n$l",
        "dodge" : 38,
        "attack": 38,
        "force" : 318,
        "damage": 73,
        "parry" : 35,
        "lvl" : 50,
        "damage_type": "砸伤"
]),
([      "action": "$N一声巨喝，$n一愣之间，$N手中$w已呼啸而至，扫向$n的$l",
        "dodge" : 31,
        "attack": 48,
        "force" : 331,
        "damage": 91,
        "parry" : 33,
        "lvl" : 75,
        "damage_type": "砸伤"
]),
([      "action": "$N身形稍退，手中$w迎风一抖，朝着$n劈头盖脸地砸将下",
        "dodge" : 49,
        "attack": 63,
        "force" : 391,
        "damage": 103,
        "parry" : 31,
        "lvl" : 100,
        "damage_type": "砸伤"
]),
([      "action": "$N脚步跄踉，左一棒，右一棒，打得$n手忙脚乱，招架不迭",
        "dodge" : 51,
        "attack": 74,
        "force" : 481,
        "damage": 167,
        "parry" : 28,
        "lvl" : 130,
        "damage_type": "砸伤"
]),
([      "action": "$N连翻几个筋斗，手中$w转得如风车一般，一连三棒直击$n顶门",
        "dodge" : 31,
        "attack": 83,
        "force" : 503,
        "damage": 184,
        "parry" : 35,
        "lvl" : 160,
        "damage_type": "砸伤"
]),
([      "action": "$N手中$w化为万道霞光，乘$n目眩之时，$w已到了$n的$l",
        "dodge" : 23,
        "attack": 98,
        "force" : 548,
        "damage": 193,
        "parry" : 51,
        "lvl" : 200,
        "damage_type": "砸伤"
]),
});


int valid_enable(string usage)
{
	return usage == "parry" || usage == "club";
}

int valid_learn(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "club")
                return notify_fail("你必须先找一根棍子才能练金猿棍法。\n");

        if ((int)me->query("max_neili") < 1000)
                return notify_fail("你的内力不足，难以修炼金猿棍法。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅，难以修炼金猿棍法。\n");

        if ((int)me->query_skill("club", 1) < 100)
                return notify_fail("你的基本棍法火候太浅，难以修炼金猿棍法。\n");

        if ((int)me->query_skill("club", 1) < (int)me->query_skill("jinyuan-gun", 1))
                return notify_fail("你的基本棍法水平不够，无法领会更高深的金猿棍法。\n");

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
        level = (int) me->query_skill("jinyuan-gun",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "club")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练金猿棍法。\n");

        if ((int)me->query("neili") < 90)
                return notify_fail("你的内力不够练金猿棍法。\n");

        me->receive_damage("qi", 75);
        me->add("neili", -85);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jinyuan-gun/" + action;
}
