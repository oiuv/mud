inherit FORCE;

int valid_enable(string usage)
{
        return usage == "force";
}

int query_neili_improve(object me)
{
        int lvl;

        lvl = (int)me->query_skill("yijin-duangu", 1);
        return lvl * lvl * 15 * 18 / 100 / 200;
}

int valid_force(string force)
{
        return 1;
}

mapping *action = ({
([      "action":"$N默自运功，依照易筋锻骨的口诀将内息在周身经脉中游走了一遍"
]),
});

mapping query_action(object me, object weapon)
{
        return action[0];
}


int valid_learn(object me)
{
        if (me->query("gender") == "无性" && (int)me->query_skill("yijin-duangu", 1) > 49)
                return notify_fail("你无根无性，阴阳不调，难以领会高深的易筋锻骨内功。\n");

        if (me->query("character") == "心狠手辣" && (int)me->query("yijin-duangu", 1) > 199)
                return notify_fail("这九阴真经中所记载的易筋锻骨正大恢弘，气度俨然，依照"
                                   "你心狠手辣的天性似乎只能学到这种程度。\n");

        if (me->query("character") == "狡黠多变" && (int)me->query("yijin-duangu", 1) > 169)
                return notify_fail("这九阴真经中所记载的易筋锻骨正大恢弘，气度俨然，依照"
                                   "你狡黠多变的天性似乎只能学到这种程度。\n");

        if (me->query("character") == "阴险奸诈" && (int)me->query("yijin-duangu", 1) > 139)
                return notify_fail("这九阴真经中所记载的易筋锻骨正大恢弘，气度俨然，依照"
                                   "你阴险奸诈的天性似乎只能学到这种程度。\n");
          if (me->query("con") < 30)
                  return notify_fail("你觉得自己先天根骨不足，一时难以修炼。\n");

        if ((int)me->query_skill("force", 1) < 100)
                return notify_fail("你的基本内功火候还不够，还不能学习易筋锻骨内功。\n");

        return ::valid_learn(me);
}

int practice_skill(object me)
{
        return notify_fail("易筋锻骨内功只能用学(learn)的来增加熟练度。\n");
}

string exert_function_file(string func)
{
        return __DIR__"yijin-duangu/" + func;
}

