// shenzhang-bada.c - 神掌八打
       
inherit SHAOLIN_SKILL;
        
mapping *action = ({
([     "action": "$N一招「横云断峰」左掌佯攻，右掌蓄势击向$n的$l",
       "force" : 120,
       "attack": 40,
       "parry" : 20,
       "dodge" : -15,
       "damage": 20,
       "lvl"   : 0,
       "skill_name" : "横云断峰",
       "damage_type" : "淤伤"
]),
([     "action": "$N飞身上前，双掌同时击出，一招「三羊开泰」，将$n笼罩于掌风之中",
       "force" : 150,
       "attack": 50,
       "parry" : 15,
       "dodge" : 0,
       "damage": 35,
       "lvl"   : 20,
       "skill_name" : "三羊开泰",
       "damage_type" : "淤伤"
]),
([     "action": "$N一招「跨虎登山」，左掌长驱直进，迅雷般拍向$n的$l",
       "force" : 180,
       "attack": 60,
       "parry" : 25,
       "dodge" : -5,
       "damage": 50,
       "lvl"   : 40,
       "skill_name" : "跨虎登山",
       "damage_type" : "淤伤"
]),
([     "action": "$N一招「龙跃深渊」，后退了一步，随后身形往后一个倒纵，右掌凌空拍向$n的$l",
       "force" : 200,
       "attack": 70,
       "parry" : 35,
       "dodge" : -15,
       "damage": 80,
       "lvl"   : 60,
       "skill_name" : "龙跃深渊",
       "damage_type" : "淤伤"
]),
([     "action": "$N一招「雁落平沙」，身体半蹲，双掌一扫，两道劲风击向$n的下盘",
       "force" : 230,
       "attack": 80,
       "parry" : 30,
       "dodge" : -15,
       "damage": 110,
       "lvl"   : 80,
       "skill_name" : "雁落平沙",
       "damage_type" : "淤伤"
]),
([     "action": "$N一个转身，一招「玄鸟划抄」，右掌连拍，掌风分三路击向$n",
       "force" : 270,
       "attack": 100,
       "parry" : 30,
       "dodge" : 5,
       "damage": 140,
       "lvl"   : 120,
       "skill_name" : "玄鸟划抄",
       "damage_type" : "淤伤"
]),
([     "action": "$N纵身而上，一招「盘龙绕步」，左掌一圈，右掌随即直拍向$n的胸口",
       "force" : 300,
       "attack": 100,
       "parry" : 10,
       "dodge" : -15,
       "damage": 160,
       "lvl"   : 160,
       "skill_name" : "盘龙绕步",
       "damage_type" : "淤伤"
]),
([     "action": "$N身体旋转起来，一招「威镇八方」，幻出无数掌影，同时击向$n",
       "force" : 350,
       "attack": 120,
       "parry" : 50,
       "dodge" : 15,
       "damage": 200,
       "lvl"   : 200,
       "skill_name" : "威镇八方",
       "damage_type" : "淤伤"
]),
});

int valid_enable(string usage) { return usage == "strike" || usage == "parry"; } 
     
int valid_combine(string combo) { return combo == "wuxiang-zhi"; } 
      
int valid_learn(object me) 
{ 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
                return notify_fail("练神掌八打必须空手。\n"); 
      
        if ((int)me->query_skill("force") < 300) 
                return notify_fail("你的内功火候不够，无法学神掌八打。\n"); 
     
        if (me->query("dex") < 26) 
                return notify_fail("你的先天条件不够，无法学神掌八打。\n");        
        if ((int)me->query("max_neili") < 3000) 
                return notify_fail("你的内力太弱，无法练神掌八打。\n"); 
      
        if ((int)me->query_skill("strike", 1) < (int)me->query_skill("shenzhang-bada", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的神掌八打。\n"); 
      
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
        level = (int) me->query_skill("shenzhang-bada", 1); 
        for (i = sizeof(action); i > 0; i--) 
                if (level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
      
int practice_skill(object me) 
{ 
        if (me->query_temp("weapon") || 
            me->query_temp("secondary_weapon")) 
                return notify_fail("你必须空手练习！\n"); 
      
        if ((int)me->query("qi") < 100) 
                return notify_fail("你的体力太低了。\n"); 
      
        if ((int)me->query("neili") < 80) 
                return notify_fail("你的内力不够练神掌八打。\n"); 
      
        me->receive_damage("qi", 90); 
        me->add("neili", -70); 
        return 1; 
} 
      
string perform_action_file(string action) 
{ 
        return __DIR__"shenzhang-bada/" + action; 
} 

