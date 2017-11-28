#include <ansi.h>  
inherit SHAOLIN_SKILL;  
 
mapping *action = ({  
([      "action": "$N棍势连绵，着着俱是进攻招式，手中$w一连几棍，劈头盖脸地朝着$n砸下",    
        "dodge" : 30,  
        "attack": 33,  
        "force" : 89,  
        "damage": 34,  
        "parry" : 35,  
        "lvl" : 0,  
        "damage_type": "砸伤"  
]), 
([      "action": "$N点、扎、缠、扫、棍风呼呼，攻势极为凌厉，舞起一团棍影齐齐罩向$n",  
        "dodge" : 35,  
        "attack": 33,  
        "force" : 116,  
        "damage": 52,  
        "parry" : 44,  
        "lvl" : 30,  
        "damage_type": "砸伤"  
]), 
([      "action": "$N哈哈大笑，单手提棍，手中$w闪电般的直袭而出，砸向$n$l",  
        "dodge" : 48,  
        "attack": 48,  
        "force" : 136,  
        "damage": 78,  
        "parry" : 40,  
        "lvl" : 60,  
        "damage_type": "砸伤"  
]), 
([      "action": "$N大喝一声，手中$w高高举起，挂着风声劈头盖脸的砸向$n的$l",  
        "dodge" : 40,  
        "attack": 58,  
        "force" : 200,  
        "damage": 100,  
        "parry" : 22,  
        "lvl" : 90,  
        "damage_type": "砸伤"  
]),  
([      "action": "$N扑身上前，手中$w骤然加紧，刹那间幻起十几条棍影，漫天飞舞，左右缭绕攻到$n的$l",  
        "dodge" : 36,  
        "attack": 66,  
        "force" : 234,  
        "damage": 101,  
        "parry" : 31,  
        "lvl" : 120,  
        "damage_type": "砸伤"  
]), 
([      "action": "$N纵身跃起，手中$w转得如车轮一般，一棒化数棒直击$n顶门",  
        "dodge" : 35,  
        "attack": 80,  
        "force" : 273,  
        "damage": 104,  
        "parry" : 35,  
        "lvl" : 150,  
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
                return notify_fail("你必须先找一根棍子才能练夜叉棍法。\n");  
 
        if ((int)me->query("max_neili") < 500)  
                return notify_fail("你的内力不足，难以修炼夜叉棍法。\n");  
        
        if (me->query("dex") < 22)      
                return notify_fail("你的先天悟性不足，难以修炼夜叉棍法。\n");  
              
        if ((int)me->query_skill("force") < 100)  
                return notify_fail("你的内功火候太浅，难以修炼夜叉棍法。\n");  
         
        if ((int)me->query_skill("club", 1) < 100)  
                return notify_fail("你的基本棍法火候太浅，难以修炼夜叉棍法。\n");  
 
        if ((int)me->query_skill("club", 1) < (int)me->query_skill("yecha-gun",       1))  
                return notify_fail("你的基本棍法水平不够，无法领会更高深的夜叉棍法。\n");  
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
        level = (int) me->query_skill("yecha-gun",1);  
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
 
        if ((int)me->query("qi") < 70)  
               return notify_fail("你的体力不够。\n");  
 
        if ((int)me->query("neili") < 60)  
               return notify_fail("你的内力不够。\n");  
 
        me->receive_damage("qi", 55);  
        me->add("neili", -45);  
        return 1;  
}  
         
string perform_action_file(string action)  
{  
        return __DIR__"yecha-gun/" + action;  
} 

