// team command: with

#include <ansi.h>

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
	object ob;

	if (! arg ||
            ! (ob = present(arg, environment(me))) ||
	    ! living(ob) ||
	    ! ob->is_character() ||
	    ob == me)
		return notify_fail("你想和谁成为伙伴？\n");

	if (! pointerp(me->query_team()) || me->is_team_leader())
        {
                if (sizeof(me->query_team()) >= 12)
                        return notify_fail("你这个队伍里面的人实在是太多"
                                           "了，大家都照顾不过来了。\n");

		if (me == ob->query_temp("pending/team"))
                {
			if (! pointerp(me->query_team()))
                        {
				ob->add_team_member(me);
				message_vision("$N决定加入$n的队伍。\n", me, ob);
			} else
                        {
				me->add_team_member(ob);
				message_vision("$N决定让$n加入队伍。\n", me, ob);
			}
			ob->delete_temp("pending/team");
			return 1;
		} else
                {
			message_vision("$N邀请$n加入$P的队伍。\n", me, ob);
			tell_object(ob, YEL "如果你愿意加入，请用 team with " +
                                    me->query("id") + "。\n" NOR);
			me->set_temp("pending/team", ob);
			return 1;
		}
	} else
		return notify_fail("只有队伍领袖可以邀请别人加入。\n");
}
