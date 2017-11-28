// duoluoye-zhi.c
       
inherit SHAOLIN_SKILL;
        
mapping *action = ({
([     "action": "$N身形前倾，右指弹出一屡劲风，飘渺无形的击向$n的$l",
       "force" : 180,
       "attack": 80,
       "parry" : 30,
       "dodge" : 15,
       "damage": 70,
       "lvl"   : 0,
       "damage_type" : "刺伤"
]),
([     "action": "$N手捏不动手印，轻轻跃起，双手回旋，将$n笼罩在指风之中",
       "force" : 200,
       "attack": 90,
       "parry" : 45,
       "dodge" : 10,
       "damage": 95,
       "lvl"   : 40,
       "damage_type" : "刺伤"
]),
([     "action": "$N揉身而上，右指长驱直入，弛点$n的大穴，一派两败俱伤的打法",
       "force" : 250,
       "attack": 100,
       "parry" : 50,
       "dodge" : 35,
       "damage": 110,
       "lvl"   : 80,
       "damage_type" : "点穴"
]),
([     "action": "$N纵身跃起，居高临下，双手分别点向$n的各大要穴",
       "force" : 300,
       "attack": 90,
       "parry" : 45,
       "dodge" : 10,
       "damage": 120,
       "lvl"   : 120,
       "damage_type" : "点穴"
]),
([     "action": "$N将内力灌注于指间，一指戳出，勇不可挡，硬破入$n的招数中，击向$n的$l",
       "force" : 420,
       "attack": 50,
       "parry" : 30,
       "dodge" : -15,
       "damage": 100,
       "lvl"   : 160,
       "damage_type" : "刺伤"
]),
([     "action": "$N跨步上前，突然连环三指击出，一气呵成，射出三屡指风击向$n",
       "force" : 260,
       "attack": 150,
       "parry" : 50,
       "dodge" : 25,
       "damage": 80,
       "lvl"   : 200,
       "damage_type" : "刺伤"
]),
([     "action": "$N纵身而上，右手食指点出，缓缓按向$n的$l，似乎毫不着力",
       "force" : 500,
       "attack": 60,
       "parry" : 55,
       "dodge" : 35,
       "damage": 120,
       "lvl"   : 240,
       "damage_type" : "内伤"
]),
([     "action": "$N缓步上前，尽起全身功力，双指弹出数道指风，将$n完全笼罩在攻势之下",
       "force" : 450,
       "attack": 70,
       "parry" : 60,
       "dodge" : 65,
       "damage": 180,
       "lvl"   : 280,
       "damage_type" : "刺伤"
]),
});

string main_skill() { return "canhe-zhi"; }

int valid_enable(string usage) { return usage == "finger" || usage == "parry"; } 
      
int valid_learn(object me) 
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
                return notify_fail("练多罗叶指必须空手。\n"); 
      
        if ((int)me->query_skill("force") < 150) 
                return notify_fail("你的内功火候不够，无法学习多罗叶指。\n"); 
     
        if ((int)me->query("max_neili") < 1500) 
                return notify_fail("你的内力太弱，无法练多罗叶指。\n"); 
      
        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("duoluoye-zhi", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的多罗叶指。\n"); 
      
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
        level = (int) me->query_skill("duoluoye-zhi", 1); 
        for (i = sizeof(action); i > 0; i--) 
                if (level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
      
int practice_skill(object me) 
{
        if ((int)me->query_skill("canhe-zhi", 1))
                return notify_fail("你已将这种指法融入参合指，不必再分开练习了。\n");

        if (me->query_temp("weapon") || 
            me->query_temp("secondary_weapon")) 
                return notify_fail("你必须空手练习。\n"); 
      
        if ((int)me->query("qi") < 130) 
                return notify_fail("你的体力太低了，无法练多罗叶指。\n"); 
      
        if ((int)me->query("neili") < 110) 
                return notify_fail("你的内力不够，无法练多罗叶指。\n");
      
        me->receive_damage("qi", 110);
        me->add("neili", -100); 
        return 1; 
} 
      
string perform_action_file(string action) 
{ 
        return __DIR__"duoluoye-zhi/" + action; 
}
