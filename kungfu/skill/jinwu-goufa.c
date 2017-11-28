// jinwu-goufa.c 金蜈钩法

#include <ansi.h>
inherit SKILL;

mapping *action = ({
([   "action" : "$N手中$w一抖，一式「灵蛇吐信」，闪电般的疾刺向$n的$l",
     "force"  : 50,
     "attack" : 15,
     "dodge"  : 10,
     "parry"  : 25,
     "damage" : 10,
     "lvl"    : 0,
     "damage_type":  "刺伤"
]),
([   "action" : "$N身形突闪，招式陡变，手中$w从一个绝想不到的方位斜刺向$n的$l",
     "force"  : 93,
     "attack" : 25,
     "dodge"  : 25,
     "parry"  : 30,
     "damage" : 5,
     "lvl"    : 10,
     "damage_type":  "刺伤"
]),
([   "action" : "$N一式「柔丝轻系」，剑意绵绵不绝，化做一张无形的大网将$n困在当中",
     "force"  : 135,
     "attack" : 33,
     "dodge"  : 22,
     "parry"  : 32,
     "damage" : 20,
     "lvl"    : 20,
     "damage_type":  "刺伤"
]),
([   "action" : "$N一声阴笑，飞身纵起，一式「张牙舞爪」，手中$w狂舞，幻出千万条手臂，合身扑向$n",
     "force"  : 189,
     "attack" : 39,
     "dodge"  : 40,
     "parry"  : 35,
     "damage" : 35,
     "lvl"    : 30,
     "damage_type":  "刺伤"
]),
([   "action" : "$N身形一旋看似欲走，手中$w却倏的从腋下穿过，疾刺向$n的$l，好一式「天蝎藏针」",
     "force"  : 221,
     "attack" : 43,
     "dodge"  : 60,
     "parry"  : 40,
     "damage" : 48,
     "lvl"    : 40,
     "damage_type":  "刺伤"
]),
([   "action" : "$N脚步踉跄，身形忽的向前跌倒，一式「井底望月」，掌中$w自下而上直刺$n的小腹",
     "force"  : 263,
     "attack" : 51,
     "dodge"  : 50,
     "parry"  : 45,
     "damage" : 63,
     "lvl"    : 70,
     "damage_type":  "刺伤"
]),
([   "action" : "$N身形一晃，一式「金蛇缠腕」，手中$w如附骨之蛆般无声无息地刺向$n的手腕",
     "force"  : 285,
     "attack" : 62,
     "dodge"  : 40,
     "parry"  : 47,
     "damage" : 87,
     "lvl"    : 100,
     "damage_type":  "刺伤"
]),
([   "action" : "$N一声厉啸，身形冲天而起，一式「神蟾九变」，掌中$w如鬼魅般连刺$n全身九道大穴",
     "force"  : 291,
     "attack" : 71,
     "dodge"  : 30,
     "parry"  : 52,
     "damage" : 91,
     "lvl"    : 110,
     "damage_type":  "刺伤"
]),
([   "action" : "$N缓缓低首，手中$w中宫直进，一式「蜈化龙形」，迅捷无比地往$n的$l刺去",
     "force"  : 313,
     "attack" : 85,
     "dodge"  : 20,
     "parry"  : 54,
     "damage" : 95,
     "lvl"    : 130,
     "damage_type":  "刺伤"
]),
([   "action" : "$N深吸一口起，招演「万毒至尊」，$w尖端透出一条强劲的黑气，闪电般的袭向$n",
     "force"  : 328,
     "attack" : 88,
     "dodge"  : 30,
     "parry"  : 62,
     "damage" : 117,
     "lvl"    : 160,
     "damage_type":  "刺伤"
]),
});

int valid_enable(string usage)
{
	return usage == "sword" || usage == "parry";
}

int valid_learn(object me)
{
        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力不够。\n");

        if ((int)me->query_skill("force") < 150)
                return notify_fail("你的内功火候太浅。\n");

        if ((int)me->query_skill("sword", 1) < 100)
                return notify_fail("你的基本剑法火候不够，无法学习金蜈钩法。\n");

        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("jinwu-goufa", 1))
                return notify_fail("你的基本剑法水平有限，无法领会更高深的金蜈钩法。\n");

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
        level   = (int) me->query_skill("jinwu-goufa",1);
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
                return notify_fail("你的体力目前没有办法练习金蜈钩法。\n");

        if ((int)me->query("neili") < 70)
                return notify_fail("你的内力不够，无法练习金蜈钩法。\n");
        
        me->add("qi", -50);
        me->add("neili", -62);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"jinwu-goufa/" + action;
}

