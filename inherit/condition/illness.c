// illness.c

inherit F_CLEAN_UP;

int dispel(object me, object ob, int duration)
{
        int need_lvl;
	int need_neili;
	string cname;

        need_lvl = duration + 60;
	need_neili = duration * 10;
        if (me != ob)
                need_lvl = need_lvl * 3 / 2;
	if (me != ob)
		need_neili = need_neili * 3 / 2;

	cname = to_chinese(this_object()->name());
        if (need_lvl > me->query_skill("force"))
        {
                if (me == ob)
                {
                        tell_object(me, "你的内功火候尚有欠缺，无法驱除" + cname +"。\n");
                        return -1;
                } else
                {
                        tell_object(me, "你的内功火候尚有欠缺，无法帮助" + ob->name() + "驱除" + cname + "。\n");
                        return -1;
                }
        }

	if (me->query("neili") < need_neili)
	{
		tell_object(me, "你的内力现在不足，无法施展以驱除" + cname + "。\n");
		return -1;
	}
	me->add("neili", -need_neili);

        if (me == ob)
        {
                tell_object(me, "调息以后，你舒服多了，感觉" + cname + "被消除了。\n");
        } else
        {
                tell_object(me, "你将内力缓缓的输入到" + ob->name() + "经脉，" +
                            ob->name() + "精神一振。\n");
                tell_object(ob, "你觉得" + me->name() +
                            "将内力输入你的奇经八脉，你舒服多了，感觉" + cname + "被消除了。\n");
        }

        ob->clear_condition(this_object()->name());

        return 1;
}
