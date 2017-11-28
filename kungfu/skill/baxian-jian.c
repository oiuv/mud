#include <ansi.h>

inherit SKILL;

mapping *action = ({
([   "action" : "$N面露微笑，一招「拨云见日」，手中$w一抖，剑光暴长，洒向$n的$l",
     "force"  : 50,
     "attack" : 15,
     "dodge"  : 10,
     "parry"  : 25,
     "damage" : 10,
     "lvl"    : 0,
     "skill_name" : "拨云见日",
     "damage_type":  "刺伤"
]),
([   "action" : "$N一招「仙人指路」，身形突闪，剑招陡变，手中$w从后部斜刺向$n的$l",
     "force"  : 70,
     "attack" : 21,
     "dodge"  : 25,
     "parry"  : 30,
     "damage" : 15,
     "lvl"    : 20,
     "skill_name" : "仙人指路",
     "damage_type":  "刺伤"
]),
([   "action" : "$N暴退数尺，一招「曹国舅拍板」，低首抚剑，随后手中$w骤然穿上，刺向$n的$l",
     "force"  : 75,
     "attack" : 23,
     "dodge"  : 22,
     "parry"  : 32,
     "damage" : 20,
     "lvl"    : 40,
     "skill_name" : "曹国舅拍板",
     "damage_type":  "刺伤"
]),
([   "action" : "$N身形一晃，疾掠而上，使一招「丹凤朝阳」，手中$w龙吟一声，对准$n连递数剑",
     "force"  : 90,
     "attack" : 29,
     "dodge"  : 10,
     "parry"  : 25,
     "damage" : 21,
     "lvl"    : 60,
     "skill_name" : "丹凤朝阳",
     "damage_type":  "刺伤"
]),
([   "action" : "$N身形一展，施展出「湘子吹箫」，如影相随，手中$w疾往$n的$l刺去",
     "force"  : 103,
     "attack" : 31,
     "dodge"  : 13,
     "parry"  : 22,
     "damage" : 23,
     "lvl"    : 80,
     "skill_name" : "湘子吹箫",
     "damage_type":  "刺伤"
]),
([   "action" : "$N一招「采和献花」，侧过身子，手中$w疾往斜上挑起，直指$n的$l",
     "force"  : 125,
     "attack" : 35,
     "dodge"  : 15,
     "parry"  : 25,
     "damage" : 28,
     "lvl"    : 100,
     "skill_name" : "采和献花",
     "damage_type":  "刺伤"
]),
([   "action" : "$N微微一个转身，一招「张果老倒骑驴」，手中$w却已自肋下穿出，罩向$n的$l",
     "force"  : 133,
     "attack" : 42,
     "dodge"  : 11,
     "parry"  : 27,
     "damage" : 33,
     "lvl"    : 120,
     "skill_name" : "张果老倒骑驴",
     "damage_type":  "刺伤"
]),
([   "action" : "$N神色微变，一招「汉锺离阴阳宝扇」，剑招顿时变得凌厉无比，手中$w闪电般射向$n",
     "force"  : 151,
     "attack" : 47,
     "dodge"  : 13,
     "parry"  : 32,
     "damage" : 36,
     "lvl"    : 140,
     "skill_name" : "汉锺离阴阳宝扇",
     "damage_type":  "刺伤"
]),
([   "action" : "$N缓缓低首，接着一招「铁拐李葫芦系腰」，手中$w中宫直进，迅捷无比地往$n刺去",
     "force"  : 165,
     "attack" : 53,
     "dodge"  : 20,
     "parry"  : 34,
     "damage" : 43,
     "lvl"    : 160,
     "skill_name" : "铁拐李葫芦系腰",
     "damage_type":  "刺伤"
]),
});

int valid_enable(string usage) {return usage == "sword" || usage == "parry";}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 200)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 20)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 10)
                return notify_fail("你的基本剑法火候不够，无法学习八仙剑法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("baxian-jian", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的八仙剑法。\n");

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
        level   = (int) me->query_skill("baxian-jian",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level / 5)];
}

int practice_skill(object me)
{
        object weapon;

        if ( ! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 50)
                return notify_fail("你的体力目前没有办法练习八仙剑法。\n");

        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力不够，无法练习八仙剑法。\n");
        
        me->add("qi", -43);
        me->add("neili", -44);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"baxian-jian/" + action;
}