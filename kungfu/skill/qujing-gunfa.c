// qujing-gunfa.c 取经棍法
// By Vin 2000

#include <ansi.h>

inherit SHAOLIN_SKILL;
 
mapping *action = ({
([      "action": "$N身形稍退，一招「大闹阎罗府」，手中$w迎风一抖，朝着$n劈头盖脸地砸将下",
        "dodge" : 31,
        "attack": 31,
        "force" : 289,
        "damage": 34,
        "parry" : 35,
        "lvl"   : 0,
        "damage_type": "砸伤"
]),
([      "action": "$N仰天长笑，看也不看，一招「谈笑退天兵」，随手一棒向$n当头砸下",
        "dodge" : 33,
        "attack": 37,
        "force" : 316,
        "damage": 41,
        "parry" : 42,
        "lvl"   : 25,
        "damage_type": "砸伤"
]),
([      "action": "$N一个虎跳，越过$n头顶，一招「勇斗二郎神」，手中$w抡个大圆，砸向$n$l",
        "dodge" : 38,
        "attack": 38,
        "force" : 318,
        "damage": 73,
        "parry" : 35,
        "lvl"   : 50,
        "damage_type": "砸伤"
]),
([      "action": "$N一声巨喝，一招「脱困老君炉」！$n一愣之间，$N手中$w已呼啸而至，扫向$n的$l",
        "dodge" : 31,
        "attack": 48,
        "force" : 331,
        "damage": 91,
        "parry" : 33,
        "lvl"   : 75,
        "damage_type": "砸伤"
]),
([      "action": "$N身形稍退，一招「大闹阎罗府」，手中$w迎风一抖，朝着$n劈头盖脸地砸将下",
        "dodge" : 49,
        "attack": 63,
        "force" : 391,
        "damage": 103,
        "parry" : 31,
        "lvl"   : 100,
        "damage_type": "砸伤"
]),
([      "action": "$N使出「醉闹蟠桃会」，脚步跄踉，左一棒，右一棒，打得$n手忙脚乱，招架不迭",
        "dodge" : 51,
        "attack": 74,
        "force" : 481,
        "damage": 167,
        "parry" : 28,
        "lvl"   : 130,
        "damage_type": "砸伤"
]),
([      "action": "$N连翻几个筋斗，使出「三打白骨精」，手中$w转得如风车一般，一连三棒直击$n顶门",
        "dodge" : 31,
        "attack": 83,
        "force" : 503,
        "damage": 184,
        "parry" : 35,
        "lvl"   : 160,
        "damage_type": "砸伤"
]),
([      "action": "$N一招「千钧澄玉宇」，手中$w化为万道霞光，乘$n目眩之时，$w已到了$n的$l",
        "dodge" : 43,
        "attack": 108,
        "force" : 548,
        "damage": 213,
        "parry" : 51,
        "lvl"   : 200,
        "damage_type": "砸伤"
]),
});


int valid_enable(string usage)
{
	return  usage == "parry" || usage == "club";
}

int valid_learn(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
           || (string)weapon->query("skill_type") != "club")
                return notify_fail("你必须先找一根棍子才能练取经棍法。\n");

        if ((int)me->query("max_neili") < 4000)
                return notify_fail("你的内力修为不足，没有办法练取经棍法。\n");

        if ((int)me->query_skill("force") < 300)
                return notify_fail("你的内功火候太浅，没有办法练取经棍法。\n");

        if ((int)me->query_skill("club", 1) < 150)
                return notify_fail("你的基本棍法火候太浅，没有办法练取经棍法。\n");

        if ((int)me->query_skill("club", 1) < (int)me->query_skill("qujing-gunfa", 1))
                return notify_fail("你的基本棍法水平不够，无法领会更高深的取经棍法。\n");

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
       

        level = (int) me->query_skill("qujing-gunfa", 1);
        		weapon = me->query_temp("weapon");
 

        if (random(me->query_skill("qujing-gunfa", 1)) > 180
           && me->query_skill("force") > 350
           && me->query("neili") > 1000
           && random(10) > 8)
        {
                me->add("neili", -200);
                return ([
                "action": HIY "$N" HIY "将" + "$w" + HIY "一挥，使出取经棍法绝技「"
                            HIR "玉宇澄清万里埃" HIY "」，霎时" + "$w" + HIY "顶端紫"
                          "芒闪耀，直袭$n" HIY,
                "force" : 800,
                "attack": 180,
                "damage": 240,
                "dodge" : 100,
                "parry" : 100,
                "damage_type": "砸伤"]);
        }

        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon"))
        || (string)weapon->query("skill_type") != "club")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 150)
                return notify_fail("你的体力不够练取经棍法。\n");

        if ((int)me->query("neili") < 150)
                return notify_fail("你的内力不够练取经棍法。\n");

        me->receive_damage("qi", 120);
        me->add("neili", -100);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qujing-gunfa/" + action;
}
