// say.c

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object env;
        mixed msg;

        if (me->ban_say(1))
                return 0;

        env = environment(me);
	if (! arg)
	{
		write("你自言自语不知道在说些什么。\n");
		message("sound", me->name() + "自言自语不知道在说些什么。\n",
			env, me);
		return 1;
	}

        if (msg = env->query("no_say"))
        {
                if (stringp(msg))
                {
                        write(msg);
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

	write(CYN "你说道：" + arg + "\n" NOR);
	message("sound", CYN + me->name() + CYN "说道：" +  arg + "\n" NOR,
		env, me);

	// The mudlib interface of say
	all_inventory(env)->relay_say(me, arg);

	return 1;
}

int help (object me)
{
	write(@HELP
指令格式: say <讯息>
 
说话，所有跟你在同一个房间的人都会听到你说的话。如果你设置了
auto_say参数，那么系统会自动的将你输入的非命令和表情动词作为
你讲的话处理。如果你设置了pure_say参数，那么除非你输入用 '/'
字符打头的命令，否则系统都将当作你说的话来处理。
 
注: 本指令可用 ' 取代.
 
HELP
	);
	return 1;
}
