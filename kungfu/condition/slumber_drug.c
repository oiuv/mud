// slumber_drug.c

inherit F_CLEAN_UP;

int update_condition(object me, int duration)
{
	int limit;

	limit = (int)me->query("neili") / 50;

	tell_object(me, "你觉得脑中昏昏沉沉，心中空荡荡的，直想躺下来睡一觉。\n");
	message("vision", me->name() + "摇头晃脑地站都站不稳，好像喝醉了一样。\n",
		environment(me), me);
	if( duration > limit ) {
		if ( living(me) ) me->unconcious();
		return 0;
	} else 
        if (me->query("neili") > 500) {
	        tell_object(me, "你发觉不妙，猛吸一口气，登时清醒了不少。\n");
                me->add("neili", -100);
                return 0;
	}

        if ( duration > 1 )
        {
                me->apply_condition("slumber_drug", duration - 1);
                return 1;
        }

	return 0;
}
