//luohan-jian 罗汉剑法 
 
#include <ansi.h> 
inherit SHAOLIN_SKILL; 
 
mapping *action = ({ 
([      "action" : "$N握紧手中$w一招「来去自如」点向$n的$l", 
        "force" : 70, 
        "dodge" : 50, 
        "damage" : 40, 
        "lvl"    : 0, 
        "skill_name" : "来去自如",  
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N一招「日月无光」，无数$w上下刺出，直向$n逼去", 
        "force" : 90, 
        "dodge" : 20, 
        "damage" : 40, 
        "lvl"    : 20, 
        "skill_name" : "日月无光", 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N向前跨上一步，手中$w使出「剑气封喉」直刺$n的喉部", 
        "force" : 100, 
        "dodge" : 80, 
        "damage" : 50, 
        "lvl"    : 40, 
        "skill_name" : "剑气封喉", 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N虚恍一步，使出「心境如水」手中$w直刺$n的要害", 
        "force" : 90, 
        "dodge" : 60, 
        "damage" : 80, 
        "lvl"    : 60, 
        "skill_name" : "心境如水", 
        "damage_type" : "刺伤" 
]), 
([      "action" : "只见$N抡起手中的$w，使出「佛光普照」万点金光直射$n", 
        "force" : 90, 
        "dodge" : 70, 
        "damage" : 110, 
        "lvl"    : 80, 
        "skill_name" : "佛光普照", 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N抡起手中的$w，使出「风行叶落」无数剑光直射$n", 
        "force" : 120, 
        "dodge" : 60, 
        "damage" : 120, 
        "lvl"    : 100, 
        "skill_name" : "风行叶落",  
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N使出「声东击西」，手中$w如刮起狂风一般闪烁不定，刺向$n", 
        "force" : 200, 
        "dodge" : 80, 
        "damage" : 140, 
        "lvl"    : 120, 
        "skill_name" : "声东击西", 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N随手使出剑法之奥义「无影无踪」，手中$w如鬼魅一般铺天盖地的刺向$n", 
        "force" : 200, 
        "dodge" : 90, 
        "damage" : 160, 
        "lvl"    : 150, 
        "skill_name" : "「无影无踪」", 
        "damage_type" : "刺伤" 
]), 
([      "action" : HIY"$N使出罗汉剑法之最终绝技「蛟龙出水」手中$w"HIY"犹如蛟龙一般刺向$n "HIY, 
        "force" : 280, 
        "dodge" : 100, 
        "damage" : 180, 
        "lvl"    : 220, 
        "skill_name" : "HIY「剑气合一」"NOR, 
        "damage_type" : "刺伤" 
]), 
}); 
         
int valid_enable(string usage) { return (usage == "sword") || (usage == "parry"); }  
 
int valid_learn(object me)  
 
{ 
        if ((int)me->query_skill("fumo-jian", 1) < 80 && (int)me->query_skill("qingliang-jian", 1) < 80)  
                return notify_fail("你得必须先精通伏魔剑，清凉剑中的一种才能继续学习高深的剑法。\n");  
        if ((int)me->query("max_neili") < 650)  
                return notify_fail("你的内力不够。\n");  
         
        if ((int)me->query_skill("hunyuan-yiqi",1) < 120)  
                return notify_fail("你的内功火候太浅。\n");  
        
        if (me->query("int") < 22)  
                return notify_fail("你的先天悟性不够。\n"); 
         
        if ((int)me->query_skill("sword",1) < 100) 

                return notify_fail("你的基本剑法不够。\n");                          
         
        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("luohan-jian", 1)) 
                return notify_fail("你的基本剑法水平有限，无法领会更高深的罗汉剑法。\n");  
        return 1;  
}  
string query_skill_name(int level)  
{ 
        int i;  
 
        for(i = sizeof(action) - 1; i >= 0; i--)  
                if(level >= action[i]["lvl"])  
                        return action[i]["skill_name"];  
} 
 
mapping query_action(object me, object weapon)  
{ 
        int i, level;  
 
        level = (int) me->query_skill("luohan-jian", 1);  
        for(i = sizeof(action); i > 0; i--)  
                if(level > action[i-1]["lvl"])  
                        return action[NewRandom(i, 20, level/5)];  
} 
         
int practice_skill(object me)  
{  
        object weapon;  
        if (! objectp(weapon = me->query_temp("weapon")) ||  
            (string)weapon->query("skill_type") != "sword")  
                return notify_fail("你必须有把剑才能够练习罗汉剑。\n");  
         
        if ((int)me->query("qi") < 70)  
                return notify_fail("你的体力不够练罗汉剑。\n");  
 
        if ((int)me->query("neili") < 70)  
                return notify_fail("你的内力不够练罗汉剑。\n");  
         
        me->receive_damage("qi", 65);  
        me->add("neili", -62);  
        return 1;  
} 
         
string perform_action_file(string action)  
{  
        return __DIR__"luohan-jian/" + action;  
} 

