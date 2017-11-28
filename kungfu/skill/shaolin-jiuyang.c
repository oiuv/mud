inherit FORCE;

mapping *action = ({
([  "action": "$N飞身一跃而起，身法陡然加快，朝着$n$l快速攻出数十拳",
    "lvl"   : 0,
    "damage_type" : "瘀伤"
]),
([  "action": "$N沉身运气，一拳击向$n，刹那间，$N全身竟浮现出一道金光",
    "lvl"   : 0,
    "damage_type" : "瘀伤"
]),
});

string main_skill() { return "jiuyang-shengong"; }

int valid_enable(string usage)
{
        return usage == "force";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("shaolin-jiuyang", 1);
        return lvl * lvl * 15 * 15 / 100 / 200;
}

mapping query_action(object me, object weapon)
{
        int i, level;
        level = (int) me->query_skill("shaolin-jiuyang",1);
        for (i = sizeof(action); i > 0; i--)
                if (level > action[i-1]["lvl"])
                        return action[random(i)];
}

int valid_force(string force)
{
        return 1;
}

int valid_learn(object me)
{
        if ((int)me->query_skill("yinyang-shiertian", 1))
                return notify_fail("你已将九阳神功融汇贯通，合成了普天之下最强"
                                   "的武功，不必再分开学习了。\n");

        if ((int)me->query_skill("jiuyang-shengong", 1))
                return notify_fail("你已将三种九阳神功全部融汇贯通，不必再分开"
                                   "学习了。\n");

        if ( me->query("gender") == "无性" && (int)me->query("shaolin-jiuyang", 1) > 9)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的少林九"
                                   "阳神功。\n");

        if (me->query("con") < 34)
                return notify_fail("你的先天根骨孱弱，无法修炼少林九阳神功。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的内功太差，无法学习少林九阳神功。\n");

        if ((int)me->query("max_neili") < 1200)
                return notify_fail("你的内力修为太浅，无法学习少林九阳神功。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("少林九阳神功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"jiuyang-sub/" + func;
}
