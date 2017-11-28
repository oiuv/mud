// reply.c

#include <ansi.h>
#include <command.h>
#include <net/dns.h>

inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
	string target, mud;
	object obj;
        string no_tell, can_tell;
        string reply_out;

	if (! arg || arg == "")
		return notify_fail("你要回答什么？\n");

	if (! stringp(target = me->query_temp("reply")) )
		return notify_fail("刚才没有人和你说过话。\n");

	if (sscanf(target, "%s@%s", target, mud) == 2)
	{
		GTELL->send_gtell(lower_case(mud), lower_case(target), me, arg);
		write("网路讯息已送出，可能要稍候才能得到回应。\n");
		return 1;
	}

	obj = find_player(target);
	if (! obj || ! me->visible(obj))
	{
		if (MESSAGE_D->send_msg_to(me, target, arg))
			return 1;
		return notify_fail("刚才和你说话的人现在已经离开游戏了。\n");
	}

        no_tell = obj->query("env/no_tell");
	if (! wizardp(me) && (no_tell == "all" || no_tell == "ALL" ||
	    is_sub(me->query("id"), no_tell)))
        {
                can_tell = obj->query("env/can_tell");
                if (! is_sub(me->query("id"), can_tell))
		        return notify_fail("这个人不想听你罗嗦啦。\n");
        }

	if (playerp(obj) && obj->is_net_dead())
		return notify_fail("这个人现在不在线上，听不到你的话。\n");

	if (! living(obj))
		return notify_fail("这人现在恐怕听不到你说的话了...\n");

	reply_out = sprintf(HIG "%s回答你：%s\n" NOR,
                            me->name(1) + HIG "(" + me->query("id") + ")", arg);
        if (! TELL_CMD->notice_user(me->name(1), me->query("id"), obj, reply_out))
                return 1;

        // 成功的回答了
	write(HIG "你回答" + obj->name(1) + HIG + "(" + obj->query("id") +
              ")：" + arg + "\n" NOR);

        // 如果选择的不是全阻塞(2)，则自动忽略这条信息，显示
        // 下一条信息。
        if (me->query("env/jam_talk") != 2)
                SKIP_CMD->main(me, "");

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式：reply <讯息>

你可以用这个指令和刚才用 tell 和你说话的使用者说话。在多人和
你交谈的时候，这个命令通常不会那么好用，因为有可能在你 reply
的时候又有人向你发送信息而导致你应答错误，在这种情况下你可以
设置参数jam_talk，选择阻塞式交谈。当你的提示符 >  的颜色变成
绿色的时候，意味你现在正收到其他人发送给你的交谈信息。

see also : tell、skip
HELP );
	return 1;
}
