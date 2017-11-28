#include <ansi.h> 
inherit SKILL; 
 
mapping *action = ({ 
([ "action": "$N将身一纵，跃在半空，一式「彩凤栖梧」，手中$w盘旋而下，鞭势灵动之至，击向$n$l", 
        "dodge": -5,    
        "damage":30,    
        "force": 100, 
        "attack": 90, 
        "parry" : 60, 
        "lvl" : 0, 
        "skill_name"    : "彩凤栖梧", 
        "damage_type": "抽伤" 
]), 
([ "action": "$N沉肩滑步，手中$w一抖，一式「凤凰展翅」，迅捷无比地分打左右两侧，$n顿时左右支绌，慌了手脚", 
        "dodge": 5, 
        "damage":50,    
        "force": 150, 
        "attack": 90, 
        "parry" : 60, 
        "lvl" : 20, 
        "skill_name"    : "凤凰展翅", 
        "damage_type": "抽伤" 
]), 
([ "action": "$N将内力注入$w，蓦地使出一式「蛟龙戏凤」，$w矫夭飞舞，直如神龙破空一般抽向$n", 
        "dodge": 10,    
        "damage":80,    
        "force": 200, 
        "attack": 100, 
        "parry" : 80, 
        "lvl" : 40, 
        "skill_name"    : "蛟龙戏凤", 
        "damage_type": "抽伤" 
]), 
([ "action": "$N一声清啸，手中$w一招「龙飞凤舞」，划出漫天鞭影铺天盖地地向$n卷来，势道猛烈之极", 
        "dodge": -10, 
        "damage":110, 
        "force": 250, 
        "attack": 100, 
        "parry" : 80, 
        "lvl" : 60, 
        "skill_name"    : "龙飞凤舞", 
        "damage_type": "抽伤" 
]), 
([ "action": "$N面露微笑跨前一步，右手$w轻扬，缓缓使出一式「龙凤呈祥」，鞭势平和中正，不带丝毫霸气", 
        "dodge": 1, 
        "damage":130, 
        "force": 300, 
        "attack": 120, 
        "parry" : 90, 
        "lvl" : 80, 
        "skill_name"    : "龙凤呈祥", 
        "damage_type": "抽伤" 
]), 
}); 
int valid_enable(string usage) { return (usage == "whip") || (usage == "parry"); } 
 
int valid_learn(object me) 
{ 
        object weapon; 
        if( (int)me->query("max_neili") < 100 ) 
                return notify_fail("你的内力不足，没有办法练习鞭法, 多练些内力再来吧。\n"); 
        
        if ((int)me->query_skill("force") < 40) 
                return notify_fail("你的内功火候太浅。\n"); 
                 
        if ( !objectp(weapon = me->query_temp("weapon"))        
               || ( string)weapon->query("skill_type") != "whip" ) 
                 return notify_fail("你必须先找一条鞭子才能练鞭法。\n"); 
         
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
       level   = (int) me->query_skill("leiming-bian",1); 
 
        for(i = sizeof(action); i > 0; i--) 
                if(level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
 
int practice_skill(object me) 
{ 
       object weapon; 
 
       if (!objectp(weapon = me->query_temp("weapon")) 
               || (string)weapon->query("skill_type") != "whip") 
               return notify_fail("你使用的武器不对。\n"); 
       if ((int)me->query_skill("force") < 100) 
               return notify_fail("你的内功火候太浅。\n"); 
       if ((int)me->query("qi") < 50) 
               return notify_fail("你的体力不够练雷鸣鞭法。\n"); 
       me->add("qi", -15); 
       return 1; 
} 
mixed hit_ob(object me, object victim, int damage_bonus, int factor) 
{ 
        object weap,weap1; 
        weap = victim->query_temp("weapon"); 
        weap1 = me->query_temp("weapon"); 
         
                if( (me->query_skill("leiming-bian") > 60) && (me->query("neili") > 100) 
                         && (victim->query_temp("weapon"))  
                         && random(10)>5) 
                  { 
                                                 message_vision(HIY "只见$N急速挥舞" + weap1->name() + "，转出无数个大小圈子，以阴柔之劲缠住对方的" + weap->name() +"！\n" NOR,        me );       
                                //               message_vision(HIY "听见「锵」地一声，$N手中的" + weap->name()     
                //               + "被"+weap1->name()+"给缠住。\n" NOR, victim ); 
                                                 if (random(me->query_str()) > victim->query_str()/2 ) 
                        {
                                message_vision(HIY "$N气运手臂用力一拽，" + weap->name() 
                                + "却无法从"+weap1->name()+"的缠绕中脱开，情急之下只好放弃了手中的兵刃。\n" NOR, victim   ); 
                                weap->move(environment(me)); 
                                                victim->reset_action(); 
                                                } else { 
                                                message_vision(HIY "$N暗运巧劲，" + weap->name() 
                                + "顺着方向快速旋转数下，解开了"+weap1->name()+"的缠绕。\n" NOR, victim   ); 
                        victim->add("neili",-50); 
                                                } 
                                                me->add("neili", -50); 
                 } 
                                       return 1; 
 
       
} 
 
string perform_action_file(string action) 
{ 
               return __DIR__"leiming-bian/" + action; 
} 

