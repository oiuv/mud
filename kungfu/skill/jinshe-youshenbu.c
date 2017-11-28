inherit SKILL;

string *dodge_msg = ({
    "$n身行如鬼魅般一晃，刹那间已远去数丈之外，$N顿时扑了个空。\n",
    "$n的身行顿时变得如蛇一般柔软，随着$N的招式左右摆动，竟使得$N招招落空。\n",
    "$n如一缕青烟般绕着$N飞快旋转，看得$N一阵头晕眼花，急忙收招跳开。\n",
    "$n怪异的一笑，身行朦胧，$N的凌厉招式竟然透体而过，原来竟是一具幻影。\n",
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
    if( (int)me->query("qi") < 50 )
        return notify_fail("你的体力太差了，不能练金蛇游身步。\n");

    me->receive_damage("qi", 40);
    return 1;
}
