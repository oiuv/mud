// hongye-daofa.c 红叶刀法 
    
inherit SHAOLIN_SKILL; 
  
mapping *action = ({ 
([      "action" : "$N手中$w轻挥，一招「冬去春来」，身形一转，一刀向$n的$l撩去", 
        "force" : 100, 
        "attack" : 10, 
        "dodge" : -10, 
        "parry" : -1, 
        "damage" : 30, 
        "lvl" : 0, 
        "skill_name" : "冬去春来", 
        "damage_type" : "割伤" 
]), 
([      "action" : "$N一招「月上西楼」，左脚虚点，$w一收一推，平刃挥向$n的脸部", 
        "force" : 130, 
        "attack" : 40, 
        "dodge" : -10, 
        "parry" : 5, 
        "damage" : 58, 
        "lvl" : 20,     
        "skill_name" : "月上西楼", 
        "damage_type" : "割伤" 
]), 
([      "action" : "$N虚步侧身，一招「推窗望月」，刀锋一卷，拦腰斩向$n", 
        "force" : 160, 
        "attack" : 40, 
        "parry" : 25, 
        "dodge" : -5, 
        "damage" : 80, 
        "lvl" : 40,     
        "skill_name" : "推窗望月", 
        "damage_type" : "割伤" 
]), 
([      "action" : "$N一招「梦断巫山」，$w自上而下划出一个大弧，笔直劈向$n",     
        "force" : 190, 
        "attack" : 55, 
        "dodge" : 5, 
        "parry" : 35, 
        "damage" : 105, 
        "lvl" : 60,     
        "skill_name" : "梦断巫山", 
        "damage_type" : "割伤" 
]), 
([      "action" : "$N侧步拧身，一招「似是而非」，拦腰反切，$w砍向$n的胸口",     
        "force" : 220, 
        "attack" : 60, 
        "dodge" : 10, 
        "parry" : 40, 
        "damage" : 95, 
        "lvl" : 80,     
        "skill_name" : "似是而非", 
        "damage_type" : "割伤" 
]), 
([      "action" : "$N挥舞$w，使出一招「红叶纷纷」，幻起片片刀影，齐齐罩向$n",   
        "force" : 240, 
        "attack" : 70, 
        "dodge" : 15, 
        "parry" : 55, 
        "damage" : 140, 
        "lvl" : 100, 
        "skill_name" : "月挂中天", 
        "damage_type" : "割伤" 
]), 
([      "action" : "$N一招「日月交辉」，只见漫天刀光闪烁，重重刀影向$n的全身涌去 ", 
        "force" : 320, 
        "attack" : 70, 
        "dodge" : 20, 
        "parry" : 60, 
        "damage" : 160, 
        "damage" : 130, 
        "lvl" : 120, 
        "skill_name" : "日月交辉", 
        "damage_type" : "割伤" 
]), 
}); 
 
int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }       
         
int valid_learn(object me) 
{ 
        if (me->query("max_neili") < 1000) 

                return notify_fail("你的内力不够。\n"); 
        if (me->query_skill("hunyuan-yiqi", 1) < 80) 

                return notify_fail("你的混元一气内功火候太浅。\n"); 
        if (me->query_skill("blade", 1) < 80) 

                return notify_fail("你的基本刀法火候太浅。\n"); 
        if (me->query("int") < 24) 
                return notify_fail("你的先天悟性不足。\n"); 
        return 1; 
} 
 
string query_skill_name(int level) 
{ 
        int     i; 
        for(i = sizeof(action)-1; i     >= 0; i--) 
        if(level >= action[i]["lvl"]) 
                return action[i]["skill_name"]; 
} 
 
mapping query_action(object me, object weapon) 
{ 
        int     i, level; 
        level   = (int) me->query_skill("hongye-daofa",1); 
        for(i = sizeof(action); i >     0; i--) 
        if(level > action[i-1]["lvl"]) 
                return action[NewRandom(i, 20, level/5)];       
} 
 
int practice_skill(object me) 
{ 
        object weapon; 
        
        if (!objectp(weapon     = me->query_temp("weapon")) 
                || (string)weapon->query("skill_type") != "blade") 
                return notify_fail("你使用的武器不对。\n"); 
        if ((int)me->query("qi") < 50) 
                return notify_fail("你的体力不够练红叶刀法。\n"); 
        if ((int)me->query("neili")     < 80) 
                return notify_fail("你的内力不够练红叶刀法。\n"); 
        me->receive_damage("qi", 25); 
        me->add("neili", -40); 
        return 1; 
} 
 
string perform_action_file(string action) 
{ 
        return __DIR__"hongye-daofa/" + action; 
} 

