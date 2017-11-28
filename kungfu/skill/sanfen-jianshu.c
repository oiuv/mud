#include <ansi.h>

inherit SKILL;

mapping *action = ({
([   "action" : "$N面露微笑，手中$w一抖，剑光暴长，洒向$n的$l",
     "force"  : 50,
     "attack" : 15,
     "dodge"  : 10,
     "parry"  : 25,
     "damage" : 10,
     "lvl"    : 0,
     "damage_type":  "刺伤"
]),
([   "action" : "$N身形突闪，剑招陡变，手中$w从一个绝想不到的方位斜刺向$n的$l",
     "force"  : 70,
     "attack" : 25,
     "dodge"  : 25,
     "parry"  : 30,
     "damage" : 5,
     "lvl"    : 10,
     "damage_type":  "刺伤"
]),
([   "action" : "$N暴退数尺，低首抚剑，随后手中$w骤然穿上，刺向$n的$l",
     "force"  : 75,
     "attack" : 33,
     "dodge"  : 22,
     "parry"  : 32,
     "damage" : 20,
     "lvl"    : 20,
     "damage_type":  "刺伤"
]),
([   "action" : "$N身形一晃，疾掠而上，一招「神驼骏足」，手中$w龙吟一声，对准$n的$l连递数剑",
     "force"  : 90,
     "attack" : 39,
     "dodge"  : 40,
     "parry"  : 35,
     "damage" : 25,
     "lvl"    : 30,
     "damage_type":  "刺伤"
]),
([   "action" : "$N神色微变，一招「风卷长草」，剑招顿时变得凌厉无比，手中$w如匹链般洒向$n的$l",
     "force"  : 180,
     "attack" : 71,
     "dodge"  : 30,
     "parry"  : 52,
     "damage" : 40,
     "lvl"    : 70,
     "damage_type":  "刺伤"
]),
([   "action" : "$N缓缓低首，接着一招「举火燎天」，手中$w中宫直进，迅捷无比地往$n的$l刺去",
     "force"  : 200,
     "attack" : 85,
     "dodge"  : 20,
     "parry"  : 54,
     "damage" : 35,
     "lvl"    : 80,
     "damage_type":  "刺伤"
]),
([   "action" : "$N矮身侧步，一招「大漠孤烟」，手中$w反手疾挑而出，“唰”的一声往$n的$l刺去",
     "force"  : 240,
     "attack" : 91,
     "dodge"  : 65,
     "parry"  : 65,
     "damage" : 58,
     "lvl"    : 100,
     "damage_type":  "刺伤"
]),
([   "action" : "$N蓦地疾退一步，又冲前三步，一招「平沙落雁」，手中$w化为一道弧光往$n的$l刺去",
     "force"  : 265,
     "attack" : 93,
     "dodge"  : 40,
     "parry"  : 68,
     "damage" : 72,
     "lvl"    : 110,
     "damage_type":  "刺伤"
]),
([   "action" : "$N纵身跃起，一招「雪中奇莲」，不见踪影，接着却又从半空中穿下，$w直逼$n的$l",
     "force"  : 290,
     "attack" : 97,
     "dodge"  : 60,
     "parry"  : 72,
     "damage" : 78,
     "lvl"    : 120,
     "damage_type":  "刺伤"
]),
([   "action" : "$N一招「千里流沙」，手中$w遥指苍空，猛然划出一个叉字，往$n的$l刺去",
     "force"  : 310,
     "attack" : 100,
     "dodge"  : 45,
     "parry"  : 75,
     "damage" : 86,
     "lvl"    : 130,
     "damage_type":  "刺伤"
]),
([   "action" : "$N一招「冰河倒泻」，左手虚击，右手$w猛的自下方挑起，激起一股劲风反挑$n的$l",
     "force"  : 330,
     "attack" : 105,
     "dodge"  : 50,
     "parry"  : 82,
     "damage" : 95,
     "lvl"    : 140,
     "damage_type":  "刺伤"
]),
});

int valid_enable(string usage) {return usage == "sword" || usage == "parry";}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 700)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 90)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不够，无法学习三分剑术。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("sanfen-jianshu", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的三分剑术。\n");

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
        level   = (int) me->query_skill("sanfen-jianshu",1);
        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (!objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "sword")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 60)
                return notify_fail("你的体力目前没有办法练习三分剑术。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练习三分剑术。\n");
        
        me->add("qi", -50);
        me->add("neili", -62);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"sanfen-jianshu/" + action;
}
