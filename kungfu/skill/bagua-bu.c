inherit SKILL;

string *dodge_msg = ({
    "$n双臂置于身后，不急不缓，昂首从$N眼前跨过，正是八卦步起手式「开步」。\n",
    "$n一式「阖步」，左手一扬，身行一晃，缓缓的向后一退，轻松让过了$N的凌厉攻势。\n",
    "$n一式「四正步」，前后脚脚尖脚跟相靠，身体如行云流水般向左滑出四步。\n",
    "$n足不动，手不抬，一转眼间便绕到了$N的身后，却是一式「四奇步」的身法。\n",
    "$n一式「天地风云」，全身化为一道白影，忽的拔地而起,在半空中一个空翻，已落到几丈远的地方。\n",
    "$n一式「龙虎鸟蜿」，身体如一只金雁般行云流水，又宛若一条矫矢苍龙急速盘旋，瞬间滑出丈余。\n",
    "$n一招「坐乾踏坤」，身随意转，瞻之在前，忽焉在后，倏地往一旁挪开了三尺。\n",
    "可是$n的身形陡地变得飘忽不定，竟丝毫不着力，令$N无法看清，正是一式「移艮走巽」的身法。\n",
    "$n一式「跑坎游离」，双臂前伸，全身贴地平飞，犹如在水面滑行一般，顿时闪过了$N的凌厉攻势。\n",
    "$n一式「离震回兑」，两臂鹏举如翼，在剌剌风声中，轻盈地一跃，$N以为$n要绕到自己的身后，但再定睛\n"
    "一看，$n却又回到了原来的位置。\n",
    "$n陡然使出一式「八面埋伏」，身形由一分二，由二变四，又四为八，犹如鬼魅忽隐忽现，令人难以琢磨。\n"
});

int valid_enable(string usage)
{
        return (usage == "dodge") ||
               (usage == "move");
}

int valid_learn(object me) { return 1; }

string query_dodge_msg(string limb)
{
        return dodge_msg[random(sizeof(dodge_msg))];
}

int practice_skill(object me)
{
    if( (int)me->query("qi") < 50 )
        return notify_fail("你的体力太差了，不能练八卦步。\n");

    me->receive_damage("qi", 40);
    return 1;
}
