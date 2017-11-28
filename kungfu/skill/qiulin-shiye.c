// qiulin-shiye.c 秋林拾叶

inherit SKILL;

string *dodge_msg = ({
        "只见$n略一低头，形似弯腰拾叶，轻而易举的躲过$N这一招。\n",
        "但是$n目光流转，双肩微动，脚步轻移已避开了$N的攻击。\n",
        "然而$n微微移步向前，仿佛直走中宫却又飘忽不定，$N的攻势全部落空。\n"
        "但是$n身形如竹叶飞舞，随风绕着$N的出招飘动，好象要击中，却若无物。\n",
        "可是$n身随意转，仿佛闲庭散步，人却已在数丈以外，闪过了这一招。\n",
});

int valid_enable(string usage) 
{ 
        return (usage == "dodge") || (usage == "move"); 
}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if( me->query("qi") < 40 )
                return notify_fail("你的体力太差了，不能练秋林拾叶。\n");
        me->receive_damage("qi", 30);
        return 1;
}

string perform_action_file(string action)
{
        return __DIR__"qiulin-shiye/" + action;
}
