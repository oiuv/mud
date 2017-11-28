// jingang-zhi.c - 少林大力金刚指
       
inherit SHAOLIN_SKILL;
        
mapping *action = ({
([     "action": "$N身体半蹲，右指中宫直进，一式「降龙伏虎」击向$n的$l",
       "force" : 80,
       "attack": 20,
       "parry" : 20,
       "dodge" : -5,
       "damage": 20,
       "lvl"   : 0,
       "skill_name" : "降龙伏虎",
       "damage_type" : "刺伤"
]),
([     "action": "$N轻轻一纵，居高临下，一式「普渡众生」，点向$n的周身大穴",
       "force" : 100,
       "attack": 40,
       "parry" : 15,
       "dodge" : 0,
       "damage": 25,
       "lvl"   : 40,
       "skill_name" : "普渡众生",
       "damage_type" : "刺伤"
]),
([     "action": "$N身形飘忽不定，一式「佛祖献花」，右指击向$n的$l",
       "force" : 110,
       "attack": 30,
       "parry" : 25,
       "dodge" : -5,
       "damage": 30,
       "lvl"   : 80,
       "skill_name" : "佛祖献花",
       "damage_type" : "刺伤"
]),
([     "action": "$N不动声色，突然一招「斩妖除魔」，左右双指分别指向$n的各大要穴",
       "force" : 150,
       "attack": 40,
       "parry" : 25,
       "dodge" : -10,
       "damage": 120,
       "lvl"   : 60,
       "skill_name" : "斩妖除魔",
       "damage_type" : "刺伤"
]),
([     "action": "$N摒指如刀，一招「五丁开山」，双指呈刀势从意想不到的角度劈向$n",
       "force" : 180,
       "attack": 50,
       "parry" : 30,
       "dodge" : -15,
       "damage": 160,
       "lvl"   : 80,
       "skill_name" : "五丁开山",
       "damage_type" : "割伤"
]),
([     "action": "$N盘膝端坐，一招「佛法无边」，右手拇指弹出一道劲风，击向$n",
       "force" : 160,
       "attack": 60,
       "parry" : 30,
       "dodge" : 5,
       "damage": 100,
       "lvl"   : 200,
       "skill_name" : "佛法无边",
       "damage_type" : "刺伤"
]),
([     "action": "$N纵身而上，一招「金刚伏魔」，双手食指端部各射出一道青气击向$n",
       "force" : 180,
       "attack": 60,
       "parry" : 40,
       "dodge" : -5,
       "damage": 120,
       "lvl"   : 225,
       "skill_name" : "金刚伏魔",
       "damage_type" : "刺伤"
]),
([     "action": "$N脸上忽现祥和之气，一招「无色无相」，一指遥遥指向$n，似乎毫无劲力",
       "force" : 200,
       "attack": 70,
       "parry" : 50,
       "dodge" : 15,
       "damage": 180,
       "lvl"   : 250,
       "skill_name" : "无色无相",
       "damage_type" : "刺伤"
]),
});

int valid_enable(string usage) { return usage == "finger" || usage == "parry"; } 
     
int valid_combine(string combo) { return combo == "xumishan-zhang"; } 
      
int valid_learn(object me) 
{ 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
                return notify_fail("练大力金刚指必须空手。\n"); 
      
        if ((int)me->query_skill("force") < 60) 
                return notify_fail("你的内功火候不够，无法学大力金刚指。\n"); 
        if (me->query("str") < 30 || me->query("con") < 32) 
                return notify_fail("你的先天条件不够，无法学大力金刚指。\n"); 
                
        if ((int)me->query("max_neili") < 300) 
                return notify_fail("你的内力太弱，无法练大力金刚指。\n"); 
      
        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("jingang-zhi", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的大力金刚指。\n"); 
      
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
        level = (int) me->query_skill("jingang-zhi", 1); 
        for (i = sizeof(action); i > 0; i--) 
                if (level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
      
int practice_skill(object me) 
{ 
        if ((int)me->query("qi") < 70) 
                return notify_fail("你的体力太低了。\n"); 
      
        if ((int)me->query("neili") < 70) 
                return notify_fail("你的内力不够练大力金刚指。\n"); 
      
        me->receive_damage("qi", 60); 
        me->add("neili", -64); 
        return 1; 
} 
      
string perform_action_file(string action) 
{ 
        return __DIR__"jingang-zhi/" + action; 
} 

