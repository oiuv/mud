// yanfly.c 燕双飞

inherit SKILL;

string *dodge_msg = ({
    "$n一个「比翼双飞」，随着$N的攻势飘起，从容躲过这一招。\n",
    "$n使出一招「巧燕穿云」，猛然纵起丈余，结果$N扑了个空。\n",
    "$n身形一摇，幻出几个人影，一招「望穿秋水」躲过了$N的攻势。\n",
    "$n一招「飞鸟投林」纵身跃起，倏忽已落至$N身后。\n",
    "$n左一摇，右一晃，一招「紫燕呢喃」已轻松闪过。\n",
});

int valid_enable(string usage)
{
        return (usage == "dodge") ;
}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if( (int)me->query("qi") < 50 )
                return notify_fail("你的体力太差了，不能练燕双飞。\n");

        me->receive_damage("qi", 40);
        return 1;
}
