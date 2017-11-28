// whisper.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
	string dest, msg;
	object ob;
        object env;
        mixed info;

	if (! arg || sscanf(arg, "%s %s", dest, msg) != 2)
		return notify_fail("你要对谁耳语些什么？\n");

        env = environment(me);
	ob = present(dest, env);

	if (! ob || ! ob->is_character())
		return notify_fail("你要对谁耳语？\n");

        if (ob == me)
		return notify_fail("你无法将嘴凑到自己的耳朵旁说话。\n");

        if (me->ban_say(1))
                return 0;

        if (info = env->query("no_say"))
        {
                if (stringp(info))
                {
                        write(info);
                        return 1;
                }

                write("这个地方不能讲话。\n");
                return 1;
        }

        if (me->query("doing") == "scheme")
        {
                if (me->query("jing") < 100)
                        return notify_fail("你现在的精神不济，等一会儿吧。\n");
                me->add("jing", -50);
        }

	write(WHT "你在" + ob->name() + WHT "的耳边悄声说道：" +
	      msg + "\n" NOR);
	tell_room(environment(me), me->name() + "在" + ob->name()
		+ "耳边小声地说了些话。\n", ({ me, ob }));
	if (! userp(ob)) ob->relay_whisper(me, msg);
	else
		tell_object(ob, WHT + me->name() +
				WHT "在你的耳边悄声说道：" + msg + "\n" NOR);
	return 1;
}

int help(object me)
{
	write( @TEXT
指令格式：whisper <某人> <讯息>

这个指令可以用来和同一房间中的人耳语，包括 NPC 在内。
TEXT );
	return 1;
}
