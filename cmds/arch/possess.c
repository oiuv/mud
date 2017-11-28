#include <ansi.h>
#include <getconfig.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	object ob;

       if (! SECURITY_D->valid_grant(me, "(arch)"))
              return 0;

	if (! arg)
		return notify_fail("你要附谁的身？\n");

       if (! me->is_admin())
              return notify_fail("你不能附身。\n");

	ob = present(arg, environment(me));

	if (! ob || ! living(ob))
		return notify_fail("这里没有这个生物。\n");

/*
	if (geteuid(ob) != geteuid(me))
		return notify_fail(ob->name() + "的 euid 和你不合，无"
				   "法进行附身。\n");
*/
	if ( ob->is_player() && ! ob->is_net_dead())
		return notify_fail("你不能附身在线玩家。\n");
	
	if (ob->query_temp("body_ob"))
		return notify_fail( ob->name() + "已经被人附身过了。\n");

	message_vision("$N化成一道光芒钻进$n体内。\n", me, ob);
	LOGIN_D->enter_world(me, ob, 1);
	ob->clear_written();
	ob->write_prompt();
	return 1;
}

int help()
{
	write(@TEXT
指令格式：posssess <目标生物>

附身到另一个生物上，这个生物必须和你有相同的 EUID。
附身後用 quit 指令会回到原来的身体。
TEXT );
	return 1;
}

