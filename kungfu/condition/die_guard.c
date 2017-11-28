#include <ansi.h>

int dispel() { return 0; }

int update_condition(object me, int duration)
{
	if (duration < 1)
        {
		tell_object(me, BEEP + HIW "你的死亡保护期限已满，以后"
                                "请自己小心了。\n" NOR);
		return 0;
	}
	me->apply_condition("die_guard", duration - 1);
	return 1;
}
