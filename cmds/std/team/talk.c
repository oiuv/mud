// team command: talk

#include <ansi.h>

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object *t;

        if (! arg) arg = "...";

	if (! pointerp(t = me->query_team()))
		return notify_fail("你现在并没有和别人组成队伍。\n");

	message("team", HIY "【队伍会话】" + me->name(1) +
                "：" + arg + "\n" NOR, t);
	return 1;
}
