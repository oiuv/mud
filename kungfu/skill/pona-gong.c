// pona-gong.c 

inherit SHAOLIN_SKILL; 
         
mapping *action = ({ 
([      "action" : "$N一式「起手式」，身体右甩，屈肘反切，双拳蓄势而发，击向$n的$l", 
        "force" : 180, 
        "dodge" : -5, 
        "parry" : -2, 
        "lvl" : 0, 
        "skill_name" : "起手式", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N一式「石破天惊」，左掌向上，右掌向下，拳风吡啪爆响，一股劲力直冲$n的$l", 
        "force" : 200, 
        "dodge" : 5, 
        "parry" : 0, 
        "damage": 10, 
        "lvl" : 9, 
        "skill_name" : "石破惊天", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N全身提气，腾空飞起，一式「铁闩横门」，双拳双腿齐出，来势汹汹，令$n无可躲藏", 
        "force" : 230, 
        "dodge" : 15, 
        "parry" : 10, 
        "damage": 10, 
        "lvl" : 29, 
        "skill_name" : "铁闩横门", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N神情凝重，双掌虚含，掌缘下沉，大喝一声，一式「千斤坠地」，缓缓向$n推出", 
        "force" : 270, 
        "dodge" : 5, 
        "parry" : 15, 
        "damage": 20, 
        "lvl" : 39, 
        "skill_name" : "千斤坠地", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N一臂前伸，一臂后指，一式「傍花拂柳」，身行急闪直$n身前，攻向$n的$l", 
        "force" : 320, 
        "dodge" : 10, 
        "parry" : 5, 
        "damage": 15, 
        "lvl" : 49, 
        "skill_name" : "傍花拂柳", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N一式「金刚挚尾」，右拳由下至上，左拳从左到右，迅雷不及掩耳之势双双击向$n的$l", 
        "force" : 380, 
        "dodge" : 25, 
        "parry" : -5, 
        "damage": 25, 
        "lvl" : 59, 
        "skill_name" : "金刚挚尾", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N两目内视，双手内笼，一式「封闭手」，双拳打向$n，只见$n躲闪过去，又击向$n的$l", 
        "force" : 420, 
        "dodge" : 15, 
        "parry" : 0, 
        "damage": 35, 
        "lvl" : 69, 
        "skill_name" : "封闭手", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N调整内息，紧握双拳，一式「粉石碎玉」，全身发出暴豆般的响声，用尽全身力量击向$n的$l", 
        "force" : 480, 
        "dodge" : 20, 
        "parry" : 10, 
        "damage": 50, 
        "lvl" : 80, 
        "skill_name" : "粉石碎玉", 
        "damage_type" : "瘀伤" 
]) 
}); 
 
int valid_enable(string usage) { return  usage=="unarmed" || usage=="parry"; } 
int valid_combine(string combo) { return combo=="hunyuan-zhang"; } 
int valid_learn(object me) 
{ 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
        return notify_fail("练破衲功须空手。\n"); 
 
      /*  if ((int)me->query_skill("hunyuan-yiqi",1) < 100)  
                return notify_fail("你的内功火候不够，无法学破衲功。\n");  */
         
        if ((int)me->query("max_neili") < 1500) 
                return notify_fail("你的内力太弱，无法练破衲功。\n"); 
        return 1; 
} 
         
mapping query_action(object me, object weapon) 
{ 
        int i, level; 
        level   = (int)me->query_skill("pona-gong",1); 
        for(i = sizeof(action); i > 0; i--) 
                if(level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
         
int practice_skill(object me) 
{ 
        if ((int)me->query("qi") < 30) 
                return notify_fail("你的体力太低了。\n"); 
         
        if ((int)me->query("neili") < 20) 
                return notify_fail("你的内力不够练破衲功。\n"); 
                me->receive_damage("qi", 30); 
                me->add("neili", -10); 
                return 1; 
} 
         
string perform_action_file(string action) 
{ 
        return __DIR__"pona-gong/" + action; 
} 

