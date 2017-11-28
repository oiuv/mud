//    /kungfu/skill/suixing-tui.c 如影随形腿 
  
#include <ansi.h> 
inherit SHAOLIN_SKILL; 
   
mapping *action = ({ 
([      "action" : "$N纵身向前，忽然伸出左腿，一式「仗义执言」，直踢$n的头部", 
        "force" : 200, 
        "dodge" : 0, 
        "parry" : 5, 
        "lvl" : 0, 
        "skill_name" : "仗义执言", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N身形一闪，双足点地，一式「七星伴月」，在空中连踢七脚，直本$n的头、胸、臂", 
        "force" : 250, 
        "dodge" : 10, 
        "parry" : -10, 
        "lvl" : 40, 
        "skill_name" : "七星伴月", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N身体前倾，左脚画圆，右腿使出一式「佛界无边」，扫向$n的腰部", 
        "force" : 300, 
        "dodge" : -10, 
        "parry" : 5, 
        "lvl" : 80, 
        "skill_name" : "佛界无边", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N左足倏地弹出，连环六腿，分踢$n的头部，胸部和裆部，正是一式「转世轮回」", 
        "force" : 350, 
        "dodge" : 10, 
        "parry" : 0, 
        "lvl" : 120, 
        "skill_name" : "转世轮回", 
        "damage_type" : "瘀伤" 
]), 
([      "action" : "$N左足独立，右腿随身形反转横扫，一招「西天极乐」，踢向$n的$l", 
        "force" : 400, 
        "dodge" : -10, 
        "parry" : 0, 
        "lvl" : 150, 
        "skill_name" : "西天极乐", 
        "damage_type" : "瘀伤" 
]),                                                    
([      "action" : "$N跃起在半空，双足带起无数劲风，一式「佛祖慈悲」迅捷无伦地卷向$n", 
        "force" : 450, 
        "dodge" : 5, 
        "parry" : -10, 
        "lvl" : 180, 
        "skill_name" : "佛祖慈悲", 
        "damage_type" : "瘀伤" 
]), 
}); 
         
int valid_enable(string usage) { return usage=="unarmed" || usage=="parry" || usage=="dodge"; }    
         
int valid_learn(object me) 
{ 
        if (me->query_temp("weapon") || me->query_temp("secondary_weapon")) 
                return notify_fail("学如影随形腿时手里不能拿武器。\n"); 
        if (me->query_skill("hunyuan-yiqi",1) < 150) 
                return notify_fail("你的内功火候不够，无法学如影随形腿。\n"); 
        if ((int)me->query("str") < 26 ||(int)me->query("dex") < 24) 
                return notify_fail("你的先天属性不足，无法学习如影随形腿。。\n");  
        if ((int)me->query("max_neili") < 600) 
                return notify_fail("你的内力太弱，无法学习如影随形腿。\n"); 
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
        string msg; 
        level   = (int) me->query_skill("ruying-suixingtui",1); 
         
        if (me->query_temp("sl_rysxt")){ 
                switch(me->query_temp("sl_rysxt")){ 
                        case 5: msg = HIY"$N忽然跃起，左脚一勾一弹，霎时之间踢出一招「如」字诀的穿心腿，直袭$n前胸"NOR;       break; 
                        case 4: msg = HIY"紧接着$N左腿勾回，将腰身一扭，那右腿的一招「影」字诀便紧随而至，飞向$n"NOR; break; 
                        case 3: msg = HIY"只见$N右脚劲力未消，便凌空一转，左腿顺势扫出一招「随」字诀，如影而至"NOR; break; 
                        case 2: msg = HIY"半空中$N脚未后撤，已经运起「形」字诀，内劲直透脚尖，在$n胸腹处连点了数十下"NOR; break; 
                        case 1: msg = HIR"这时$N双臂展动，带起一股强烈的旋风，双腿霎时齐并，「如影随形」一击重炮轰在$n胸堂之上"NOR; break; 
                        default: msg = HIY"$N忽然跃起，左脚一勾一弹，霎时之间踢出一招「如」字诀的穿心腿，直袭$n前胸"NOR; break;        
                }     
                me->add_temp("sl_rysxt", -1);                   
                return([       
                        "action": msg,         
                        "force" : 400+random(100), 
                        "dodge" : random(30)-15, 
                        "damage_type" : me->query_temp("sl_rysxt")?"内伤":"瘀伤", 
                ]); 
        } 
                     
        for(i = sizeof(action); i > 0; i--) 
                if(level > action[i-1]["lvl"]) 
                        return action[NewRandom(i, 20, level/5)]; 
} 
         
int practice_skill(object me) 
{ 
        if ((int)me->query("qi") < 80) 
                return notify_fail("你的体力太低了。\n"); 
        if ((int)me->query("neili") < 20) 
                return notify_fail("你的内力不够练如影随形腿。\n"); 
        me->add("qi", -60); 
        me->add("neili", -10); 
        return 1; 
} 
         
string perform_action_file(string action) 
{ 
         return __DIR__"ruying-suixingtui/" + action; 
} 

