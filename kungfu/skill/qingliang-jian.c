// qingliang-jian.c  清凉剑法 
         
inherit SHAOLIN_SKILL; 
mapping *action = ({ 
([      "action" : "$N举剑过顶，弯腰躬身，恭敬一式「清风送暖」，$w向$n的$l轻轻刺去，", 
        "force" : 120, 
        "dodge" : 20, 
        "damage" : 35, 
        "lvl" : 0, 
        "damage_type" : "刺伤" 
]), 
([      "action" : "突然间剑光一吐，长剑化作一道白虹，$N使出一式「风清似水」，剑气古朴，$w直刺$n的$l", 
        "force" : 140, 
        "dodge" : 15, 
        "damage" : 50, 
        "lvl" : 10, 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N左手向外一分，右手$w向右掠出一招「风声四起」，剑气森然地向$n的$l挥去", 
        "force" : 200, 
        "dodge" : 15, 
        "damage" : 60, 
        "lvl" : 20, 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N一剑从空中疾劈而下，招式看似平平无奇，但呼的一声响，实有石破天惊的气势，一招「凉风决」$w如虹地刺向$n的$l", 
        "force" : 240, 
        "dodge" : 10, 
        "damage" : 70, 
        "lvl" : 30, 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N一柄$w自半空中横过，剑身似曲似直，如一件活物一般，一式「清水凉风」奔腾矫夭，气势雄浑地斩向$n的$l", 
        "force" : 270, 
        "dodge" : 10, 
        "damage" : 80, 
        "lvl" : 40, 
        "damage_type" : "割伤" 
]), 
([      "action" : "$N威仪整肃一式「玉井天池」，$w轰然一动，犹如千军万马奔驰而来，疾疾刺向$n的$l", 
        "force" : 280, 
        "dodge" : 5, 
        "damage" : 90, 
        "lvl" : 50, 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N剑转一式「叠翠浮青」，俨然长枪大戟，黄沙千里，$w电闪雷鸣，将$n笼罩于重重剑气之中", 
        "force" : 300, 
        "dodge" : 5, 
        "damage" : 110, 
        "lvl" : 60, 
        "damage_type" : "刺伤" 
]), 
([      "action" : "$N剑尖向下，一招「清风影动」，$w忽然急转直上，剑气将$n的上身要害团团围住", 
        "force" : 380, 
        "dodge" : -5, 
        "damage" : 135, 
        "lvl" : 70, 
        "damage_type" : "刺伤" 
]), 
}); 
                 
int valid_enable(string usage) { return (usage == "sword") || (usage == "parry"); } 
 
int valid_learn(object me) 
{ 
        if ((int)me->query("max_neili") <       500)  
                return notify_fail("你的内力不够。\n"); 
        if ( (int)me->query_skill("shaolin-xinfa", 1) < 50) 
                return notify_fail("你的少林心法火候太浅。\n"); 
        if ((int)me->query_skill("sword", 1) < 50) 
                return notify_fail("你的基本剑法火候尚浅。\n"); 
        return 1; 
} 
 
mapping query_action(object me, object weapon) 
{ 
        int i, level; 
        level   = (int) me->query_skill("qingliang-jian",1); 
        for(i = sizeof(action); i > 0; i--) 
                if(level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)];        
} 
         
int practice_skill(object me) 
{ 
        object weapon; 
 
        if (!objectp(weapon = me->query_temp("weapon")) 
                || (string)weapon->query("skill_type") != "sword") 
                return notify_fail("你使用的武器不对。\n"); 
        if ((int)me->query("qi") < 50) 
                return notify_fail("你的体力不够练清凉剑法。\n"); 
        me->receive_damage("qi", 35); 
        return 1; 
} 
 
string perform_action_file(string action) 
{ 
        return __DIR__"qingliang-jian/" + action; 
} 

