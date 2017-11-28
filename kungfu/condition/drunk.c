// drunk.c

inherit F_CLEAN_UP;

int dispel(object me, object ob, int duration)
{
        int need_lvl;

        need_lvl = duration + 50;
        if (me != ob)
                need_lvl = need_lvl * 3 / 2;;

        if (need_lvl > me->query_skill("force"))
        {
                if (me == ob)
                {
                        tell_object(me, "你的内功火候尚有欠缺，无法消除醉酒的影响。\n");
                        return -1;
                } else
                {
                        tell_object(me, "你的内功火候尚有欠缺，无法帮助" + ob->name() + "消除醉酒的影响。\n");
                        return -1;
                }
        }

        if (me == ob)
        {
                tell_object(me, "调息以后，你清醒多了，再没有半点醉酒的感觉。\n");
        } else
        {
                tell_object(me, "你将内力缓缓的输入到" + ob->name() + "经脉，" +
                            ob->name() + "精神一振。\n");
                tell_object(ob, "你觉得" + me->name() +
                            "将内力输入你的奇经八脉，你清醒多了，再没有醉酒的感觉。\n");
        }

        ob->clear_condition("drunk");

        return 1;
}

int update_condition(object me, int duration)
{
	int limit;

	limit = (me->query("con") + (int)me->query("max_neili") / 50) * 2;

	if (duration > limit && living(me))
        {
		me->unconcious();
		return 0;
	} else if (!living(me))
        {
		message("vision", me->name() + "打了个隔，不过依然烂醉如泥。\n",
			environment(me), me);
	} else if (duration > limit / 2)
        {
		tell_object(me, "你觉得脑中昏昏沉沉，身子轻飘飘地，大概是醉了。\n");
		message("vision", me->name() + "摇头晃脑地站都站不稳，显然是喝醉了。\n",
			environment(me), me);
		me->receive_damage("jing", 10);
	} else if (duration > limit/4)
        {
		tell_object(me, "你觉得一阵酒意上冲，眼皮有些沉重了。\n");
		message("vision", me->name() + "脸上已经略显酒意了。\n",
			environment(me), me);
		me->receive_healing("jing", 10);
		me->receive_healing("qi", 15);
	}

	me->apply_condition("drunk", duration - 1);
	if (! duration) return 0;
	return 1;
}
