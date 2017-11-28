inherit SHAOLIN_SKILL;
        
mapping *action = ({
([
       "action": "$N左手一个虚晃，右指跟进，一招「割肉饲鹰」，右指击向$n的$l",
       "force" : 80,
       "attack": 25,
       "parry" : 15,
       "dodge" : -5,
       "damage" : 50,
       "lvl"   : 0,
       "skill_name" : "割肉饲鹰",
       "damage_type" : "刺伤"
]),
([
       "action": "$N揉身而上，随后身形一矮，一式「投身饿虎」,试图拿住$n的周身大穴",
       "force" : 100,
       "attack": 30,
       "parry" : 15,
       "dodge" : 0,
       "damage" : 65,
       "lvl"   : 20,
       "skill_name" : "投身饿虎",
       "damage_type" : "点穴"
]),
([
       "action": "$N面露凶光，一式「斫头谢天」,手指直击向$n的百汇大穴",
       "force" : 150,
       "attack": 50,
       "parry" : 5,
       "dodge" : -15,
       "damage" : 100,
       "lvl"   : 40,
       "skill_name" : "斫头谢天",
       "damage_type" : "点穴"
]),
([
       "action": "$N摒指如刀，一招「折骨出髓」,双指划出一条刀路砍向$n的腰部",
       "force" : 150,
       "attack": 30,
       "parry" : 25,
       "dodge" : 10,
       "damage" : 100,
       "lvl"   : 60,
       "skill_name" : "折骨出髓",
       "damage_type" : "割伤"
]),
([
       "action": "$N忽然左腾右纵，双指连点，一招「挑身千灯」，一时间无数道劲气同时击向$n",
       "force" : 180,
       "attack": 45,
       "parry" : 0,
       "dodge" : -15,
       "damage" : 120,
       "lvl"   : 80,
       "skill_name" : "挑身千灯",
       "damage_type" : "刺伤"
]),
([
       "action": "$N提起身形，一招「挖眼布施」,居高临下，以讯雷不及掩耳的速度功向$n",
       "force" : 180,
       "attack": 35,
       "parry" : 0,
       "dodge" : -15,
       "damage" : 100,
       "lvl"   : 100,
       "skill_name" : "挖眼布施",
       "damage_type" : "割伤"
]),
([
       "action": "$N双指分左右两路，一招「剥皮书经」，分别点向$n两处大穴，令$n措不及防",
       "force" : 200,
       "attack": 50,
       "parry" : 10,
       "dodge" : 15,
       "damage" : 120,
       "lvl"   : 120,
       "skill_name" : "剥皮书经",
       "damage_type" : "点穴"
]),
([
       "action": "$N一招「剜心决志」，一指对准自己，随后就地一个翻滚，右手食指戳向$n的$l",
       "force" : 220,
       "attack": 60,
       "parry" : 20,
       "dodge" : 25,
       "damage" : 130,
       "lvl"   : 160,
       "skill_name" : "剜心决志",
       "damage_type" : "刺伤"
]),
([
       "action": "$N一招「刺血满地」，双手十指连弹，一时间无数道劲气如潮水般涌向$n，令$n无从躲闪",
       "force" : 300,
       "attack": 100,
       "parry" : 40,
       "dodge" : 55,
       "damage" : 200,
       "lvl"   : 200,
       "skill_name" : "刺血满地",
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
                return notify_fail("练修罗指必须空手。\n"); 
      
        if ((int)me->query_skill("force") < 200) 
                return notify_fail("你的内功火候不够，无法学修罗指。\n"); 
     
        if ((int)me->query("max_neili") < 800) 
                return notify_fail("你的内力太弱，无法练修罗指。\n"); 
      
        if ((int)me->query_skill("finger", 1) < (int)me->query_skill("xiuluo-zhi", 1))
                return notify_fail("你的基本指法水平有限，无法领会更高深的修罗指。\n"); 
      
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
        level = (int) me->query_skill("xiuluo-zhi", 1); 
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
      
        if ((int)me->query("qi") < 100) 
                return notify_fail("你的体力太低了，无法练修罗指。\n"); 
      
        if ((int)me->query("neili") < 100) 
                return notify_fail("你的内力不够，无法练修罗指。\n");
      
        me->receive_damage("qi", 80);
        me->add("neili", -80); 
        return 1; 
} 
      
string perform_action_file(string action) 
{ 
        return __DIR__"xiuluo-zhi/" + action; 
} 

