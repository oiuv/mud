
//擒拿十八打 
 
inherit SHAOLIN_SKILL; 
         
mapping *action = ({ 
([  "action" : "$N马步一立，身子微曲，暗喝一声，一招「望月拜天」，似爪似拳直捅$n的$l", 
        "force" : 170, 
        "dodge" : 0, 
        "parry" : 10, 
        "lvl" : 0, 
        "skill_name" : "望月拜天", 
        "damage_type" : "瘀伤" 
]), 
([  "action" : "$N“哈哈”一笑，左拳由下至上，右手似擒似推，一招「跨日向天」，交替打向$n", 
        "force" : 200, 
        "dodge" :-5, 
       "parry" : 5, 
        "lvl" : 15, 
        "skill_name" : "跨日向天", 
        "damage_type" : "瘀伤" 
]), 
([  "action" : "$N对$n一声大喝，使一招「长虹经天」，左拳击出，右脚同时绊向的$l", 
        "force" : 230, 
        "dodge" : 0, 
       "parry" : 10, 
        "lvl" : 30, 
        "skill_name" : "长虹经天", 
        "damage_type" : "震伤" 
]), 
([      "action" : "$N闷喝一声，双拳向上分开，一记「举火烧天」，拳划弧线，左右同时击向$n的$l", 
        "force" : 260, 
        "dodge" : 0, 
       "parry" : 0, 
        "lvl" : 45, 
        "skill_name" : "举火烧天", 
        "damage_type" : "瘀伤" 
]), 
([  "action" : "$N施出「轻臂擎天」，左手凌空打出，直逼$n的$l", 
        "force" : 290, 
        "dodge" : 0, 
        "parry" : 5, 
        "lvl" : 60, 
        "skill_name" : "一臂擎天", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N一声长啸，双拳交错击出，一招「石破天惊」，拳风密布$n的前后左右", 
        "force" : 310, 
        "dodge" : 10, 
       "parry" : 10, 
        "lvl" : 70, 
        "skill_name" : "石破天惊", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N怒吼一声，凌空飞起，一式「天崩地裂」，双拳居高临下，齐齐捶向$n", 
        "force" : 350, 
        "dodge" : 20, 
       "parry" : -10, 
        "lvl" : 80, 
        "skill_name" : "天崩地裂", 
        "damage_type" : "内伤" 
]), 
([  "action"    : "$N仰天大笑，势若疯狂，衣袍飞舞，一招「无法无天」，左擒右拿，如雨点般向$n打去", 
        "force" : 380, 
        "dodge" : -5, 
       "parry" : -10, 
        "lvl" : 90, 
        "skill_name" : "无法无天", 
        "damage_type" : "内伤" 
]) 
}); 
int valid_enable(string usage) { return usage=="unarmed" || usage=="parry"; } 
int valid_combine(string combo) { return combo=="luohan-quan"; } 
 
         
int valid_learn(object me) 
{ 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
                return notify_fail("练「擒拿十八打」必须空手。\n"); 
    /*    if ((int)me->query_skill("hunyuan-yiqi", 1) < 100)      
                return notify_fail("你的混元一气等级不够，无法学「擒拿十八打」。\n");*/
        if ((int)me->query("max_neili") < 1000) 
                return notify_fail("你的内力太弱，无法练「擒拿十八打」。\n"); 
        
        if ((int)me->query_skill("unarmed",1) < 100) 
                return notify_fail("你的基本拳脚太弱，无法练「擒拿十八打」。\n");
        
      /*  if ((int)me->query_skill("hunyuan-yiqi", 1)< 100)
                return notify_fail("你的心一气混元功太弱，无法练「擒拿十八打」。\n");  */
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
        if (( (int)me->query_skill("unarmed", 1) >= 120 ) 
                &&  ( (int)me->query_skill("qinna-shibada", 1) >= 120 ) 
                && ( (int)me->query_skill("cuff",1) >= 120 ) 
                && ( (int)me->query_skill("luohan-quan", 1) >= 120 ) 
                && ( (int)me->query("neili") >= 500 ) 
                &&  (me->query_skill_prepared("cuff") == "luohan-quan") 
                && (me->query_skill_mapped("unarmed") == "qinna-shibada")       
                && random(10) > 8       ) 
        {       
                return ([ 
                        "action": "$N手中招式突然加快，一招“掌擒双绝”，隔空向$n击出一拳，随即双掌连环击出", 
                                "parry":(int)me->query_skill("parry")/8,        
                        "dodge":(int)me->query_skill("dodge") / 20      + (int)me->query_skill("unarmed") / 15,   
                        "force": (int)me->query_skill("cuff") + (int)me->query_skill("unarmed"), 
                        "damage_type": "内伤" 
                        ]); 
        } 
         
        level   = (int) me->query_skill("qinna-shibada",1);     
                for(i = sizeof(action); i > 0; i--) 
                        if(level > action[i-1]["lvl"]) 
                                return action[NewRandom(i, 20, level/5)]; 
} 

int practice_skill(object me) 
{ 
        if ((int)me->query("neili") < 50)
                return notify_fail("你的内力太低了。\n");
                if ((int)me->query("qi") < 50)
                return notify_fail("你的体力不够练「擒拿十八打」。\n");
                me->add("neili", -35);
                me->add("qi", -40);
                return 1; 
} 

