// team command: form

#include <ansi.h>

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object *t;

	if (! pointerp(t = me->query_team()) || ! me->is_team_leader())
		return notify_fail("你必须是一个队伍的领袖才能组织阵形。\n");

	if (! me->query_skill(arg, 1))
		return notify_fail("这种阵形你没学过。\n");

	return SKILL_D(arg)->form_array(me);
}
