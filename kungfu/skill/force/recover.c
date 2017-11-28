// recover.c

int exert(object me, object target)
{
	int n, q;

	if (me != target)
		return notify_fail("你只能用内功调匀自己的气息。\n");

	if ((int)me->query("neili") < 20)
		return notify_fail("你的内力不够。\n");

	q = (int)me->query("eff_qi") - (int)me->query("qi");
	if (q < 10)
		return notify_fail("你现在气力充沛。\n");
	n = 100 * q / me->query_skill("force");
        if (me->query("breakup"))
                n = n * 7 / 10;
	if (n < 20)
		n = 20;
	if (me->query("special_skill/self"))
		n = n * 7 / 10;

	if ((int)me->query("neili") < n)
        {
		q = q * (int)me->query("neili") / n;
		n = (int)me->query("neili");
	}

	me->add("neili", -n);
	me->receive_heal("qi", q);
	
        message_vision("$N深深吸了几口气，脸色看起来好多了。\n", me);

        if (me->is_fighting() && ! me->query("special_skill/self"))
		me->start_busy(1);
	
	return 1;
}
