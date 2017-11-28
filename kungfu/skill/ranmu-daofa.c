#include <ansi.h>

inherit SHAOLIN_SKILL;
 
mapping *action = ({
([      "action" : "$N面带微笑，一招「烈火烧身」，举$w对着$n连砍了八八六十四刀，刀气纵横，迅雷不可挡",
        "dodge" : 1,
        "attack": 31,
        "force" : 231,
        "damage": 94,
        "parry" : 2,
        "lvl"   : 0,
        "damage_type": "割伤"
]),
([      "action": "$N仰天长笑，施展出一招「天火燎原」，顿时幻出数柄$w同时斩向$n",
        "dodge" : 12,
        "attack": 37,
        "force" : 263,
        "damage": 151,
        "parry" : 3,
        "lvl"   : 30,
        "damage_type": "割伤"
]),
([      "action": "$N腾身飞跃，越过$n头顶，一招「烈焰焚心」，手中$w直劈而下，斩向$n$l",
        "dodge" : 9,
        "attack": 31,
        "force" : 251,
        "damage": 189,
        "parry" : 4,
        "lvl"   : 100,
        "damage_type": "割伤"
]),
([      "action" : "$N运起内功一招「点木生火」，$w上带着无比劲气，划了一个大弧，从上而下劈向$n的$l",
        "dodge" : 16,
        "attack": 28,
        "force" : 242,
        "damage": 207,
        "parry" : 7,
        "lvl"   : 120,
        "damage_type": "割伤"
]),
([      "action": "$N手臂一沉，一招「张弓望月」，双手持$w划出一道雪亮刀光，接着拦腰反切，砍向$n的$l",
        "dodge" : 11,
        "attack": 33,
        "force" : 263,
        "damage": 219,
        "parry" : 9,
        "lvl"   : 140,
        "damage_type": "割伤"
]),
([      "action": "$N挥舞$w上劈下撩，左挡右开，使出一招「烈火腾云」，卷起阵阵刀风，齐齐罩向$n",
        "dodge" : 17,
        "attack": 31,
        "force" : 289,
        "damage": 237,
        "parry" : 13,
        "lvl"   : 160,
        "damage_type": "割伤"
]),
([      "action": "$N一招「火中取栗」，左脚跃步落地，手中$w单刀往前，挟着炙热的风声劈向$n的$l",
        "dodge" : 13,
        "attack": 41,
        "force" : 323,
        "damage": 261,
        "parry" : 4,
        "lvl"   : 180,
        "damage_type": "割伤"
]),
([      "action": "$N腾空而起，半空中一招「玉石俱焚」，手中$w挥出满天流光般的刀影，向$n的全身卷去",
        "dodge" : 11,
        "attack": 34,
        "force" : 302,
        "damage": 289,
        "parry" : 7,
        "lvl"   : 200,
        "damage_type": "割伤"
]),
});


int valid_enable(string usage) { return  (usage =="parry")|| (usage =="blade"); }

int valid_learn(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你必须先找一把刀才能练燃木刀法。\n");

        if ((int)me->query("max_neili") < 2000)
                return notify_fail("你的内力不足，没有办法练燃木刀法，多练些内力再来吧。\n");

        if ((int)me->query_skill("force") < 250)
                return notify_fail("你的内功火候太浅，没有办法练燃木刀法。\n");

        if ((int)me->query_skill("blade", 1) < 100)
                return notify_fail("你的基本刀法火候太浅，没有办法练燃木刀法。\n");

        if ((int)me->query_skill("blade", 1) < (int)me->query_skill("ranmu-daofa", 1))
                return notify_fail("你的基本刀法水平还不够，无法领会更高深的燃木刀法。\n");

        if ((int)me->query("int") < 32 || (int)me->query("con") < 30)
                return notify_fail("你先天太差，难以领会燃木刀法的要诣。\n");
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
        level = (int) me->query_skill("ranmu-daofa", 1);

        if (random(me->query_skill("ranmu-daofa", 1)) > 120 &&
             me->query_skill("force") > 100 &&
             me->query("neili") > 1000 &&
             random(10) > 6)
        {
                me->add("neili", -100);
                return ([
                "action": HIR "$N" HIR "忽然高宣一声佛号，身体急速"
                          "旋转，遍体通红，袈裟鼓起。刹那间手中兵器" 
                          HIR "一道火光闪过，迸\n出一股灼热的气流，"
                          "袭向$n" HIR "！" NOR,
                "dodge" : 11,
                "attack": 34,
                "force" : 302,
                "damage": 289,
                "parry" : 7,
                "damage_type": "割伤"]);
        }

        for(i = sizeof(action); i > 0; i--)
                if(level > action[i-1]["lvl"])
                        return action[NewRandom(i, 20, level/5)];
}

int practice_skill(object me)
{
        object weapon;

        if (! objectp(weapon = me->query_temp("weapon")) ||
            (string)weapon->query("skill_type") != "blade")
                return notify_fail("你使用的武器不对。\n");

        if ((int)me->query("qi") < 80)
                return notify_fail("你的体力不够练燃木刀法。\n");

        if ((int)me->query("neili") < 90)
                return notify_fail("你的内力不够练燃木刀法。\n");

        me->receive_damage("qi", 75);
        me->add("neili", -85);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"ranmu-daofa/" + action;
}

