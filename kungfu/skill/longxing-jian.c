//longxing-jian.c 
inherit SHAOLIN_SKILL; 
         
mapping *action = ({ 
([      "action" : "$N使一招「苍龙无形」手中$w一提，插向$n的$l", 
        "damage" : 40, 
        "parry": 40, 
        "force": 150, 
        "damage_type" : "挫伤", 
        "skill_name" : "苍龙无形" 
]), 
([      "action": "$N使出「飞龙擎天」，身形微弓,手中$w倏的向$n的$l戳去", 
        "damage" : 50, 
        "dodge": 80, 
        "parry": 10, 
        "force": 250, 
        "damage_type": "刺伤", 
        "skill_name" : "飞龙擎天" 
]), 
([      "action": "$N身子微曲，左足反踢，乘势转身，使一招「龙形万裂」，右手$w已戳向$n$l", 
        "damage" : 60, 
        "dodge": 80, 
        "parry": 20, 
        "force": 250, 
        "damage_type": "刺伤", 
        "skill_name" : "龙形万裂" 
]), 
([      "action" : "$N使一式「神龙初现」，身子往下一缩,$w掠过其咽喉,急奔$n急射而来", 
        "damage" : 170, 
        "force" : 450, 
        "dodge" : 90, 
        "lvl" : 100, 
        "damage_type" : "刺伤", 
        "skill_name" : "神龙初现" 
]), 
([      "action": "$N忽的在地上一个筋斗,使一招「金龙腾空」,从$n胯下钻过,手中$w直击$n", 
        "damage" : 180, 
        "dodge": 80, 
        "parry": 70, 
        "force": 350, 
        "damage_type": "刺伤", 
        "skill_name" : "金龙腾空" 
]), 
([      "action": "$N双腿一缩，似欲跪拜，一招「龙飞凤舞」左手抓向$n右脚足踝，右手$w直击$n小腹",   
        "dodge": 80, 
        "damage" : 80, 
        "parry": -10, 
        "force": 400, 
        "damage_type": "内伤", 
        "skill_name" : "龙飞凤舞" 
]), 
([      "action": "$N突然一个倒翻筋斗，一招「狄青降龙」，双腿一分，跨在肩头，双掌直击$n", 
        "dodge": 90, 
        "damage" : 90, 
        "parry": 30, 
        "force": 400, 
        "damage_type": "内伤", 
        "skill_name" : "狄青降龙" 
]), 
}); 
 
int valid_enable(string usage) { return usage=="sword"|| usage=="staff"|| usage=="parry"; } 
 
int valid_learn(object me) 
{ 
        if (me->query("str") < 24) 
                return notify_fail("你先天臂力不足。\n"); 
 
        if (me->query("int") < 30) 
                return notify_fail("你先天悟性不足。\n"); 
 
        if ((int)me->query("max_neili") < 2000) 
                return notify_fail("你的内力修为不够，难以修炼龙形剑法。\n"); 
 
        if ((int)me->query_skill("hunyuan-yiqi",1) < 200) 
                return notify_fail("你的内功火候太浅，难以修炼龙形剑法。\n"); 
         
        if ((int)me->query_skill("sword", 1) < 200) 
                return notify_fail("你的剑法根基不足，难以修炼龙形剑法。\n"); 
 
        if ((int)me->query_skill("sword", 1) < (int)me->query_skill("longxing-jian", 1)) 
                return notify_fail("你的基本剑法水平有限，无法领会更高深的龙形剑法。\n"); 
         
        return 1; 
} 
         
mapping query_action(object me, object weapon) 
{ 
        return action[random(sizeof(action))]; 
} 
 
string query_skill_name(int level) 
{ 
        int i; 
        for (i = sizeof(action) - 1; i >= 0; i--) 
                if (level >= action[i]["lvl"]) 
                        return action[i]["skill_name"]; 
} 
         
int practice_skill(object me) 
{ 
        if ((int)me->query("qi") < 50) 
                return notify_fail("你的体力太低了。\n"); 
        if ((int)me->query("neili") < 50) 
                return notify_fail("你的内力不够练龙形剑法。\n"); 
        me->add("qi", -30); 
        me->add("neili", -40); 
        return 1; 
} 
         
string perform_action_file(string action) 
{ 
        return __DIR__"longxing-jian/" + action; 
} 
         
         

