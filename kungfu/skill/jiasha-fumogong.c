         
#include <ansi.h> 
         
inherit SKILL; 
         
mapping *action = ({ 
([      "action" : "$N左手虚按，右腿使一招「一步等天」，向$n的$l踢去", 
        "attack" : 30, 
        "force"  : 70, 
        "dodge"  : 42, 
        "parry"  : 99, 
        "damage" : 22, 
        "skill_name" : "一步等天", 
        "lvl" : 0, 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N左手虚出，右手使一招「袈裟拦雀」，向$n的$l袭去", 
        "attack" : 40, 
        "force" : 85, 
        "dodge" : 81, 
        "parry" : 102, 
        "damage" : 42, 
        "skill_name" : "袈裟拦雀", 
        "lvl" : 30, 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N使一招「直冲拳」，左手回撤，有拳向$n的$l直击而去", 
        "attack" : 50, 
        "force" : 100, 
        "dodge" : 88, 
        "parry" : 105, 
        "damage" : 44, 
        "skill_name" : "直冲拳", 
        "lvl" : 140, 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N忽地分开右手上左手下，一招「双风贯耳」，向$n的$l和面门打去", 
        "attack" : 30, 
        "force" : 125, 
        "dodge" : 86, 
        "parry" : 119, 
        "damage" : 45, 
        "skill_name" : "双风贯耳", 
        "lvl" : 160, 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N左手由胸前向下，右臂微曲，使一招「伏魔式」，向$n的$l推去", 
        "attack" : 56, 
        "force" : 150, 
        "dodge" : 94, 
        "parry" : 115, 
        "damage" : 52, 
        "skill_name" : "伏魔式", 
        "lvl" : 180, 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N双手回收，一式「反云手」，向$n的$l推去", 
        "attack" : 54, 
        "force" : 185, 
        "dodge" : 102, 
        "parry" : 122, 
        "damage" : 83, 
        "skill_name" : "反云手", 
        "lvl" : 200, 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N身体向后腾出，左手略直，右臂微曲，使一招「镇魔拳」，向$n的$l和面门打去", 
        "attack" : 70, 
        "force" : 215, 
        "dodge" : 132, 
        "damage" : 82, 
        "skill_name" : "镇魔拳", 
        "lvl" : 220, 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N双手伸开，招「镇魂式」，将$n浑身上下都笼罩在重重掌影之中", 
        "attack" : 81, 
        "force" : 260, 
        "dodge" : 154, 
        "parry" : 145, 
        "damage" : 92, 
        "skill_name" : "镇魂式", 
        "lvl" : 230, 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N双手握拳，左手猛地向前推出，一招「荡魔式」，直奔$n心窝而去", 
        "attack" : 90, 
        "force" : 285, 
        "dodge" : 166, 
        "parry" : 175, 
        "damage" : 100, 
        "skill_name" : "荡魔式", 
        "lvl" : 240, 
]), 
([      "action" : "$N飞身而起，半空中双拳翻滚而出，一招「降妖伏魔」，一股劲风直逼$n", 
        "attack" : 120, 
        "force" : 340, 
        "dodge" : 178, 
        "parry" : 185, 
        "damage" : 120, 
        "skill_name" : "降妖伏魔", 
        "lvl" : 250, 
        "damage_type" : "瘀伤" 
]), 
}); 
 
int valid_enable(string usage) { return usage == "unarmed" || usage == "parry";        } 
 
int valid_learn(object me) 
{ 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
                return notify_fail("练袈裟伏魔功必须空手。\n"); 
 
        if (me->query("str") < 30) 
                return notify_fail("你先天臂力不足，无法修炼袈裟伏魔功。\n"); 

        if ((int)me->query_skill("force") < 280) 
                return notify_fail("你的内功火候不够，无法学袈裟伏魔功。\n"); 
 
        if ((int)me->query("max_neili") < 1800) 
                return notify_fail("你的内力太弱，无法练袈裟伏魔功。\n"); 
         
        if ((int)me->query_skill("ruying-suixingtui", 1) < 160) 
                return notify_fail("你的如影随形腿火候不够，无法学袈裟伏魔功。\n"); 
        if ((int)me->query_skill("unarmed", 1) < 120) 
                return notify_fail("你的基本拳脚火候不够，无法学袈裟伏魔功。\n"); 
 
        if ((int)me->query_skill("unarmed", 1) < (int)me->query_skill("jiasha-fumogong", 1)) 
                return notify_fail("你的基本拳脚水平有限，无法领会更高深的袈裟伏魔功。\n"); 
 
        if ((int)me->query_skill("ruying-suixingtui", 1) < (int)me->query_skill("jiasha-fumogong", 1)) 
                return notify_fail("你的如影随形腿水平有限，无法领会更高深的袈裟伏魔功。\n"); 
 
        return 1; 
} 
 
string query_skill_name(int level) 
{ 
        int i; 
        for (i = sizeof(action)-1; i >= 0; i--) 
                if (level >= action[i]["lvl"]) 
                        return action[i]["skill_name"]; 
} 
 
mapping query_action(object me, object weapon) 
{ 
        int i, level; 
        level = (int) me->query_skill("jiasha-fumogong", 1); 
        for (i = sizeof(action); i > 0; i--) 
                if (level > action[i - 1]["lvl"]) 
                        return action[NewRandom(i, 5, level / 5)]; 
} 
 
varargs mixed hit_ob(object me, object victim, int damage_bonus)  
{ 
        int lvl;  
 
        lvl = me->query_skill("jiasha-fumogong", 1);  
 
        if (damage_bonus < 150  
            || lvl < 180  
            || me->query("neili") < 300  
            || me->query_temp("weapon")  
            || me->query_temp("secondary_weapon")  
            || me->query_skill_mapped("force") != "yijinjing"  
            || me->query_skill_prepared("unarmed") != "jiasha-fumogong")  
                return 0;  
        {  
                me->add("neili", -30);  
                victim->receive_wound("qi", (damage_bonus - 100) / 4, me);  
                return HIY "$N" HIY "内力猛催，突然间一股浑厚无比的的内力"  
                       HIY "透体而入，只听$n一声闷哼！\n" NOR;  
        } 
} 
         
int practice_skill(object me) 
{ 
        if ((int)me->query("qi") < 70) 
                return notify_fail("你的体力太低了。\n"); 
 
        if ((int)me->query("neili") < 70) 
                return notify_fail("你的内力不够练袈裟伏魔功。\n"); 
 
        me->receive_damage("qi", 65); 
        me->add("neili", -59); 
        return 1; 
} 
 
string perform_action_file(string action) 
{ 
        return __DIR__"jiasha-fumogong/" + action; 
} 

 

