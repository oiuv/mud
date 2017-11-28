
#include <ansi.h> 
inherit SHAOLIN_SKILL; 
         
mapping *action = ({ 
([      "action" : "$N内息转动，运劲于单刀，全身骨节一阵暴响，起手一式「示诞生」向$n劈出，将$n全身笼罩在赤热的刀风下", 
        "skill_name" : "示诞生", 
        "force" : 300, 
        "lvl" : 0, 
        "dodge" : 15, 
        "damage_type" : "瘀伤", 
]), 
([      "action" : "$N面带轻笑，一招「始心镜」，火焰刀内劲由内及外慢慢涌出，$P双掌如宝像合十于胸前，向着$n深深一鞠", 
        "skill_name" : "始心镜", 
        "force" : 350, 
        "lvl" : 20, 
        "dodge" : 10,  
        "damage_type" : "震伤", 
]), 
([      "action" : "$N刀掌相合又打开，这招「现宝莲」以火焰刀无上功力聚出一朵红莲，盛开的花瓣飞舞旋转，漫布在$n四周", 
        "skill_name" : "现宝莲", 
        "force" : 400, 
        "lvl" : 50, 
        "dodge" : 5, 
        "weapon" : "红莲刀气", 
        "damage_type" : "割伤", 
]), 
([      "action" : "$N面带金刚相，刀气搓圆，使无数炙热的刀气相聚，这招「破法执」犹如一只巨大的飞鹰，凌空向$n飞抓而下", 
        "skill_name" : "破法执", 
        "force" : 340, 
        "lvl" : 70, 
        "dodge" : 1, 
        "damage_type" : "内伤", 
]), 
([      "action" : "$N暴喝一声，竟然使出伏魔无上的「开显圆」，气浪如飓风般围着$P飞旋，炎流将$n一步步向着$P拉扯过来", 
        "skill_name" : "开显圆", 
        "force" : 450, 
        "lvl" : 120, 
        "dodge" : -10, 
        "damage_type" : "震伤", 
]), 
([      "action" : "$N口念伏魔真经，钢刀连连劈出，将$n笼罩在炙焰之下，这如刀切斧凿般的「显真常」气浪似乎要将$p从中劈开", 
        "skill_name" : "显真常", 
        "force" : 380, 
        "lvl" : 140, 
        "dodge" : -5,  
        "weapon" : "无形刀气", 
        "damage_type" : "割伤", 
]), 
([      "action" : "$N现宝相，结迦兰，右手「归真法」单刀挥出，半空中刀气凝结不散，但发出炙灼的气浪却排山倒海般地涌向$n", 
        "skill_name" : "归真法", 
        "force" : 450, 
        "lvl" : 160, 
        "dodge" : -15,  
        "damage_type" : "瘀伤", 
]), 
([      "action" : "$N虚托刀柄，一式「吉祥逝」，内力运转，跟着全身衣物无风自动，$P身体微倾，闪电一刀，斩向$n$",    
        "skill_name" : "吉祥逝", 
        "force" : 500, 
        "lvl" : 180, 
        "dodge" : 5,  
        "weapon" : "无形气浪", 
        "damage_type" : "割伤", 
]), 
}); 
          
int valid_enable(string usage) { return usage == "blade" || usage == "parry"; }      
 
int valid_learn(object me) 
{ 
        if ((int)me->query("max_neili") < 1500)  

                return notify_fail("以你的内力修为，还不足以练习戒尘刀。\n"); 
        if ((int)me->query("con") < 24) 
                return notify_fail("你的根骨太低，不能驾御戒尘刀。\n"); 
        if ((int)me->query_skill("hunyuan-yiqi", 1) < 80) 

                return notify_fail("你的混元一气内功修为太浅。\n"); 
        if ((int)me->query_skill("blade",1) < 100) 
                return notify_fail("你的基本刀法太浅，不能学戒尘刀。\n"); 
 
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
        level = (int) me->query_skill("jiechen-dao",1); 
        for(i = sizeof(action); i > 0; i--) 
                if(level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
         
int practice_skill(object me) 
{ 
        object weapon; 
 
      if (! objectp(weapon = me->query_temp("weapon")) || 
          (string)weapon->query("skill_type") != "blade")  
                return notify_fail("你先找把刀再说吧！\n"); 
 
        if ((int)me->query("qi") < 70 || (int)me->query("neili") < 50) 
                return notify_fail("你的体力不够，练不了戒尘刀。\n"); 
        me->add("qi", -60);     
        me->add("neili",-35); 
        return 1; 
} 
 
string perform_action_file(string action) 
{ 
        return __DIR__"jiechen-dao/" + action; 
} 
/* 
mixed hit_ob(object me, object victim, int damage_bonus, int factor) 
{ 
        if(  me->query("blade", 1) == me->query_skill("force", 1) 
                && me->query_skill_mapped("blade") =="jiechen-dao") 
                me->set_temp("xiuluo", 1);      
} 
*/
