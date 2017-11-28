// yiwei-dujiang.c 一苇渡江 
// modified by karma 2004 
      
inherit SHAOLIN_SKILL; 
   
string *dodge_msg = ({ 
        "$n一式「一苇渡江」，前后脚脚尖脚跟相靠，身体如行云流水般滑出丈余。\n", 
         "$n一式「雨燕掠波」，双臂前伸，全身贴地平飞，顿时闪过了$N的凌厉攻势。\n", 
        "$n一式「苍龙出水」，双脚点地，全身化为一道白影，急速绕着$N打了几转。\n", 
        "$n身形飘飘，使出一招「身随意转」，避过了$N的攻击。\n", 
        "$n使出「洛河清波」，犹如在水面滑行一般，身形晃了开去。\n", 
        "$n一个「银鹭渡海」，跃起数尺，躲过了$N这一招。\n", 
}); 
     
int valid_enable(string usage) 
{ 
        return usage == "dodge" || usage == "move"; 
} 
  
int valid_learn(object me) 
{ 
        if (me->query("dex") < 24)  
                return notify_fail("你先天身法不足！\n");  
        if (me->query("int") < 26)  
                return notify_fail("你先天悟性不足！\n");  
        return 1; 
} 
         
string query_dodge_msg(string limb) 
{ 
        return dodge_msg[random(sizeof(dodge_msg))]; 
} 
         
int practice_skill(object me) 
{ 
        if((int)me->query("qi") < 50 ) 
                return notify_fail("你的体力太差了，不能练一苇渡江。\n"); 
        me->receive_damage("qi", 40); 
        return 1; 
} 
string perform_action_file(string action)  
{         
        return __DIR__"yiwei-dujiang/" + action;  
}  

