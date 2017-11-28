// skip.c

#include <command.h>

inherit F_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
        mixed list;
        mixed info;
        string msg;

        list = me->query_temp("tell_list");
        if (arrayp(list) && sizeof(list) > 0)
        {
                if (arg == "all")
                {
                        // 显示所有的历史信息
                        msg = "以下是你收到的所有信息：\n";
                        foreach (info in list)
                        {
                                if (! arrayp(info) || sizeof(info) < 3 ||
                                    ! stringp(info[2]))
                                        // 这条历史信息不合法
                                        continue;
                                msg += info[2];
                        }
                        if (strlen(msg) < 1024)
                                tell_object(me, msg);
                        else
                                // 消息太多
                                me->start_more(msg);

                        me->delete_temp("tell_list");
                        me->delete_temp("reply");
                        return 1;
                }

                // 去掉一条消息
                list = list[1..<1];

                // 整理一下，取出下一条历史信息
                while (sizeof(list) > 0)
                {
                        info = list[0];
                        if (! arrayp(info) || sizeof(info) < 3 ||
                            ! stringp(info[0]) ||
                            ! stringp(info[1]) ||
                            ! stringp(info[2]))
                        {
                                // 这条历史信息不合法
                                list = list[1..<1];
                                continue;
                        }

                        // 找到了合法的历史信息
                        me->set_temp("reply", info[1]);
                        if (strlen(info[2]) < 1024)
                                tell_object(me, info[2]);
                        else
                                // 历史消息太长，需要用MORE方式显示
                                me->start_more(info[2]);
                        break;
                }

                if (sizeof(list) < 1)
                {
                        // 已经没有任何消息了
                        me->delete_temp("tell_list");
                        me->delete_temp("reply");
                        if (previous_object() != find_object(REPLY_CMD))
                                write("现在没有任何历史消息了。\n");
                        return 1;
                } else
                        me->set_temp("tell_list", list);
        } else
        {
                if (! undefinedp(list))
                        me->delete_temp("tell_list");

                if (previous_object() != find_object(REPLY_CMD))
                        write("你现在并收到没有任何消息。\n");
        }

	return 1;
}

int help(object me)
{
	write(@HELP
指令格式：skip [all]

如果你和别人交谈的时候设置了阻塞方式的交谈，那么在你回答某人
信息之前系统不会将其他任何你的交谈信息发送给你。如果你不需要
回答，直接想看下面的信息，就可以用 skip 命令略过。而skip all
则忽略所有信息。如果你设置的是半阻塞方式，那么即使你回答某人
信息，系统也不会跳到下一条信息，必须手工输入skip命令。在有信
息阻塞的时候，你的提示符 > 会变成绿色。

这条命令可以用 . 来代替。

see also : tell、reply
HELP );
	return 1;
}
