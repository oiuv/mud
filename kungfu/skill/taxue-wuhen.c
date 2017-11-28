// taxue-wuhen.c 踏雪无痕

inherit SKILL;

string *dodge_msg = ({
    "$n左一点右一晃，随即回到原地，轻巧地躲过了$N这一招。\n",
    "$n腾身跃起一个空翻，并顺势闪到一边。\n",
    "$n轻轻往旁边一纵，就已离$N有了相当的距离，$N这一招自然失效。\n",
    "$n揉身而上，轻灵地跃过$N，闪到了$N的背后。\n",
    "$n身形急闪，斜向前一步，竟然已经躲开了$N的这一招。\n",
    "$N眼前一花，却见$n竟然已离自己有数丈之远，却没见$n如何躲过自己的攻击。\n",
    "$N一个不留神，$n已没了踪影。$N急转身，却见$n在那儿向自己招手。\n",
    "$N一招攻出，$n已然不见，$N茫然四顾，却不见$n的影子！\n",
});

int valid_enable(string usage) { return (usage == "dodge") || (usage == "move"); }

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
    return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
    if((int)me->query("qi") < 50 )
        return notify_fail("你的体力太差了，不能练踏雪无痕。\n");

    me->receive_damage("qi", 40);
    return 1;
}
