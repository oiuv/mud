inherit SKILL;

string *dodge_msg = ({
        "$n一式「龙腾势」，身行一转，猛的跳向一旁,躲过了$N的功势。\n",
        "$n一式「退马势」，双臂置于身后，不急不缓，昂首从$N眼前跨过。\n",
        "$n一式「虎跃势」，不退反进，一下子绕到了$N的身后。\n",
        "$n一式「摆荷势」，缓缓的向后一退，轻松让过了$N的凌厉攻势。\n",
        "$n一式「插柳势」，左手一扬，身行一晃，便向右飘出丈远。\n",
        "$n一式「落瀑势」，全身化为一道白影，忽的一个空翻，从左边飘到右边。\n",
        "$n一式「揽月势」，宛若一条矫矢苍龙，倏的拔地而起，令$N不敢仰视。\n",
});

int valid_enable(string usage)
{
	return usage == "dodge" || usage == "move";
}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
        if((int)me->query("qi") < 50 )
                return notify_fail("你的体力太差了，不能练天山飞渡。\n");

        me->receive_damage("qi", 40);
        return 1;
}
