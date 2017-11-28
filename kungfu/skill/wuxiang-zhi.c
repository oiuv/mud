// wuxiang-zhi.c - 少林无相指法
       
inherit SHAOLIN_SKILL;
        
mapping *action = ({
([     "action": "$N随手前踏上一步，右指中宫直进，一式「无声无息」击向$n的$l",
       "force" : 80,
       "attack": 20,
       "parry" : 20,
       "dodge" : -5,
       "damage": 20,
       "lvl"   : 0,
       "skill_name" : "无声无息",
       "damage_type" : "刺伤"
]),
([     "action": "$N一招「无欲无望」，轻唱一声佛号，左右看似随意一弹，一屡劲风已射向$n",
       "force" : 90,
       "attack": 30,
       "parry" : 5,
       "dodge" : 20,
       "damage": 50,
       "lvl"   : 40,
       "skill_name" : "无欲无望",
       "damage_type" : "刺伤"
]),
([     "action": "$N身形飘忽不定，一式「无法无天」，右指击向$n的$l",
       "force" : 150,
       "attack": 50,
       "parry" : 35,
       "dodge" : 25,
       "damage": 80,
       "lvl"   : 80,
       "skill_name" : "无法无天",
       "damage_type" : "刺伤"
]),
([     "action": "$N脚踏七星步，突然一招「佛光普照」，左指从意想不到的角度攻向$n的各大要穴",
       "force" : 180,
       "attack": 70,
       "parry" : 35,
       "dodge" : -10,
       "damage": 100,
       "lvl"   : 120,
       "skill_name" : "佛光普照",
       "damage_type" : "刺伤"
]),
([     "action": "$N一招「佛恩济世」，背朝$n，转身一指，令$n防不胜防",
       "force" : 230,
       "attack": 70,
       "parry" : 30,
       "dodge" : 15,
       "damage": 130,
       "lvl"   : 160,
       "skill_name" : "佛恩济世",
       "damage_type" : "割伤"
]),
([     "action": "$N盘膝端坐，一招「佛法无边」，右手拇指弹出一道劲风，击向$n",
       "force" : 160,
       "attack": 60,
       "parry" : 30,
       "dodge" : 5,
       "damage": 100,
       "lvl"   : 120,
       "skill_name" : "佛法无边",
       "damage_type" : "刺伤"
]),
([     "action": "$N双目紧闭，一招「无色无相」，聚集全身内力于一指射出一道无色劲气直逼$n",
       "force" : 250,
       "attack": 100,
       "parry" : 50,
       "dodge" : 25,
       "damage": 180,
       "lvl"   : 200,
       "skill_name" : "无色无相",
       "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) { return usage == "finger" || usage == "parry"; } 
     
int valid_combine(string combo) { return combo == "shenzhang-bada"; } 
      
int valid_learn(object me) 
{ 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
                return notify_fail("练无相指必须空手。\n"); 
      
        if ((int)me->query_skill("force") < 60) 
                return notify_fail("你的内功火候不够，无法学无相指。\n"); 
     
        if ((int)me->query("max_neili") < 300) 
                return notify_fail("你的内力太弱，无法练无相指。\n"); 
      
        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("wuxiang-zhi", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的无相指。\n"); 
      
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
        level = (int) me->query_skill("wuxiang-zhi", 1); 
        for (i = sizeof(action); i > 0; i--) 
                if (level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
      
int practice_skill(object me) 
{ 
        if (me->query_temp("weapon") || 
            me->query_temp("secondary_weapon")) 
                return notify_fail("你必须空手练习！\n"); 
      
        if ((int)me->query("qi") < 70) 
                return notify_fail("你的体力太低了。\n"); 
      
        if ((int)me->query("neili") < 70) 
                return notify_fail("你的内力不够练无相指。\n"); 
      
        me->receive_damage("qi", 50); 
        me->add("neili", -30); 
        return 1; 
} 
      
string perform_action_file(string action) 
{ 
        return __DIR__"wuxiang-zhi/" + action; 
} 
