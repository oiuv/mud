 
#include <ansi.h> 
#include <mudlib.h> 
         
inherit SHAOLIN_SKILL; 
inherit F_DAMAGE; 
         
mapping *action = ({ 
([      "action":"$N神色端庄，长吸一口气，左手食指突然点向$n胸口", 
        "force" : 350, 
        "dodge" : 30, 
        "damage" : 50, 
        "parry" : 35, 
        "weapon": "无形剑气", 
        "skill_name" :  "无相无色",   
        "lvl" : 10, 
        "damage_type" : "刺伤" 
]), 
([ 
        "action":"$N飘然退后，右手中指三曲三伸，一股无形指力猛袭$n下腹", 
        "force" : 400, 
        "dodge" : 40,  
        "parry" : 30,    
        "damage" : 80,   
        "weapon": "无形剑气", 
        "skill_name" :  "烦恼无劫",  
        "lvl" : 50, 
        "damage_type" : "刺伤" 
]), 
([ 
        "action":"$N丝毫不为$n所动，双手交替中，一式“烦恼无归”已封住了$n的所有退路", 
        "force" : 450, 
        "dodge" : 40, 
        "parry" : 25, 
        "damage": 100, 
        "weapon": "无形剑气", 
        "skill_name" :  "烦恼无归", 
        "lvl" : 80, 
        "damage_type" : "内伤" 
]), 
([       
        "action":"$N中指划动，无形指力弥漫四周。$n顿时上蹿下跳狼狈躲避", 
        "force" : 500, 
        "dodge" : 50, 
        "parry" : 50, 
        "damage": 130, 
        "weapon": "无形剑气", 
        "skill_name" :  "烦恼无尽", 
        "lvl" : 90, 
        "damage_type" : "刺伤" 
]), 
([ 
        "action":"$N忽然间化指为掌，“烦恼无形”意味古拙，掌力广被，$n莫辨其方向，难以招架", 
        "force" : 550, 
        "dodge" : 55,  
        "damage": 170, 
        "weapon": "无形剑气", 
        "skill_name" :  "烦恼无形", 
        "lvl" : 60, 
        "damage_type" : "内伤" 
]), 
([ 
        "action":"$N俯身前探，右手食指连点数下，已将参和指发挥至极致", 
        "force" : 550, 
        "dodge" : 55, 
        "parry" : 50, 
        "damage" : 200, 
        "weapon": "无形剑气", 
        "skill_name" :  "烦恼无极", 
        "lvl" : 75, 
        "damage_type" : "刺伤" 
]), 
([       
        "action":"$N遥点数指，却是半点风声也无，$n胸口一紧，顿觉遍体冰凉", 
        "force" : 580,  
        "dodge" : 60, 
        "parry" : 50, 
        "damage" : 250, 
        "weapon": "无形剑气", 
        "skill_name" :  "烦恼无指", 
        "lvl" : 90, 
        "damage_type" : "刺伤" 
]), 
});   
 
int valid_enable(string usage) 
{ 
        return usage == "finger" || usage == "parry"; 
} 
         
int valid_learn(object me) 
{          
        int aa,bb; 
        aa = (int)me->query_skill("hunyuan-yiqi",1); 
        bb = (int)me->query_skill("qufannao-zhi",1); 
 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
                return notify_fail("练去烦恼指必须空手。\n"); 
         
        if ( bb  >= 60 && aa < 140 && 5 * aa <= 4 * bb ) 
                return notify_fail("你的内功不够，无法修练更高深的去烦恼指。\n"); 
         
        if ((int)me->query("str") <24) 
                return notify_fail("你的先天臂力不够，无法学去烦恼指。\n");     
        
        if ((int)me->query_skill("finger", 1) <120) 
                return notify_fail("你的基本指法火候不够，无法学去烦恼指。\n");        
        return 1; 
} 
         
int practice_skill(object me) 
{ 
        if ((int)me->query("neili") < 50) 
                return notify_fail("你的内力不够练去烦恼指。\n"); 
 
        if ((int)me->query("qi") < 50) 
                return notify_fail("你的体力不够练去烦恼指。\n"); 
 
        me->add("neili", -20); 
        me->add("qi", -20); 
        return 1; 
 
} 
 
mapping query_action(object me, object weapon) 
{ 
        int i, level; 
        level = (int)me->query_skill("qufannao-zhi", 1); 
        for(i = sizeof(action); i > 0; i--) 
                if(level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
 
string query_skill_name(int level) 
{ 
        int i; 
        for(i = sizeof(action)-1; i >= 0; i--) 
                if(level >= action[i]["lvl"]) 
                        return action[i]["skill_name"]; 
} 
                 
string perform_action_file(string action) 
{ 
        return __DIR__"qufannao-zhi/" + action; 
} 
/*       
mixed hit_ob(object me, object victim, int damage_bonus, int factor) 
{ 
        if( random(me->query_skill("qufannao-zhi", 1)) > 80 )  
        { 
                victim->apply_condition("hh_damage", 
                random(me->query_skill("qufannao-zhi", 1) / 3) + victim->query_condition("hh_damage"));  
        }  
        if ( victim->query_temp("jinzhongzhao") ) { 
                victim->apply_condition("hh_damage", victim->query_condition("hh_damage") / 3);      
        } 
} 
*/       

