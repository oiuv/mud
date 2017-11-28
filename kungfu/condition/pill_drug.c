// pill_drug.c

#include <login.h>

int dispel()
{
	return 0;
}

int update_condition(object me, int duration)
{
	if (duration < 1) return 0;
	me->apply_condition("pill_drug", duration - 1);
	return 1;
}
