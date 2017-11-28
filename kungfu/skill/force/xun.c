// xun.c

int exert(object me, object target)
{
        object where;

        if (! me->query("can_perform/wiz_test"))
                return notify_fail("你所学的内功中没有这种功能。\n");

        if (! me->query("quest/id"))
                return notify_fail("你所学的内功中没有这种功能。\n");

        target = find_player(me->query("quest/id"));

        if (! target)
                target = find_living(me->query("quest/id"));

        if (! target)
                target = find_object(me->query("quest/id"));

        if (! target)
                return notify_fail("没有找到这个人物。\n");

        where = environment(target);

        if (! where)
                return notify_fail("这个人不知道在那里耶。\n");

        if (target->query("place")
           && (target->query("place") == "西域"
           || target->query("place") == "很远的地方"))
                target->move("/d/foshan/street3");

        write(sprintf("%s(%s)现在在%s(%s).\n",
                (string)target->name(1),
                (string)target->query("id"),
                (string)where->short(),
                (string)file_name(where)));
        
        return 1;
}

