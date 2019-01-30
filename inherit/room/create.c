// create.c
// create chat room
// by Doing

// #pragma save_binary

#include <ansi.h>
#include <room.h>

inherit ROOM;

void setup()
{
        set("channel_id", "聊天精灵");
        ::setup();
}

varargs private mixed query_chat_room(string id)
{
        object *rooms;
        rooms = filter_array(children(CHAT_ROOM),
                             (: clonep($1) && stringp($1->query("owner_id")) &&
                                $1->query("startroom") == base_name(this_object()) :));
        if (id)
        {
                rooms = filter_array(rooms, (: $1->query("owner_id") == $(id) :));
                if (sizeof(rooms) < 1)
                        return 0;
                return rooms[0];
        }
        return rooms;
}

int do_chathere(string arg)
{
        object *rooms;
        object owner;
        string *msg;
        int i;

        rooms = query_chat_room();
        if (! sizeof(rooms))
                return notify_fail("目前没有任何人建立聊天室。\n");

        write("目前在" + short() + "的聊天室有以下这些：\n"
              HIC "≡" HIY "──────────────────────────────" HIC "≡\n" NOR);
        msg = allocate(sizeof(rooms));
        for (i = 0; i < sizeof(rooms); i++)
        {
		if (rooms[i]->invisible_for(this_player()))
		{
			msg[i] = 0;
			continue;
		}

                owner = find_player(rooms[i]->query("owner_id"));
                msg[i] = sprintf("  %-30s    现在：%d人",
                                 rooms[i]->short(),
                                 sizeof(filter_array(all_inventory(rooms[i]), (: userp($1) && this_player()->visible($1) :))));
                if (rooms[i]->welcome(this_player()))
                        msg[i] = HIC + msg[i] + NOR;
                else
                        msg[i] = HIR + msg[i] + NOR;
        }
        msg = sort_array(filter_array(msg, (: stringp :)), 1);
        write(implode(msg, "\n") + "\n"
              HIC "≡" HIY "──────────────────────────────" HIC "≡\n" NOR);
        return 1;
}

int do_enter(string arg)
{
        object ob;
        object me;
	object ride;

        if (! arg)
                return do_chathere(arg);

        me = this_player();
        if (! objectp(ob = query_chat_room(arg)) ||
	    ob->invisible_for(me))
                return notify_fail("没有这个聊天室。\n");

	if (objectp(ride = me->query_temp("riding")))
		return notify_fail("没听说过有人能骑" + ride->name() +
			 	   "进聊天室的。\n");

        message_vision("$N快步往" + ob->short() + "走去。\n", me);
        if (! ob->welcome(me))
        {
                message("vision", "却见" + me->name() + "转了一圈，又悻"
                        "悻的走了回来，看来是不太受人家欢迎。\n",
                        environment(me), ({ me }));
                tell_object(me, "人家不欢迎你，你还是别去扫兴了。\n");
                return 1;
        }
        me->move(ob);
        message("vision", me->name() + "走了进来。\n",
                environment(me), ({ me }));
        return 1;
}

int do_newchat(string arg)
{
        object *rooms;
        object me;
        object room;

        me = this_player();
        rooms = filter_array(children(CHAT_ROOM),
                             (: clonep($1) && $1->query("owner_id") == $(me)->query("id") :));
        if (sizeof(rooms) > 0)
                return notify_fail("你已经建了聊天室了，在关闭它之前不能另建。\n");

        if (me->query_skill("idle-force", 1) < 10)
                return notify_fail("你的发呆神功等级太低，还无法发呆出一个聊天室来。\n");

        room = new(CHAT_ROOM);
        room->init_room(this_object(), me);
        write("你建好了聊天室。\n");
        message_vision("$N耸耸肩，往" + room->short() + "而去。\n", me);
        me->move(room);
        if (find_call_out("clean_chat_room") == -1)
                call_out("clean_chat_room", 15 * 60);
        return 1;
}

int do_clean(string arg)
{
        object *rooms;
        int i;

        if (! is_root(this_player()))
                return notify_fail("你没有权限在这里清除聊天室。\n");

        rooms = query_chat_room();
        if (! sizeof(rooms))
                return notify_fail("目前没有任何人建立聊天室。\n");

        if (arg)
        {
                rooms = filter_array(rooms, (: $1->query("owner_id") == $(arg) :));
                if (! sizeof(rooms))
                        return notify_fail("目前 " + arg + " 并没有建立聊天室。\n");
        }

        rooms = filter_array(rooms, (: ! sizeof(filter_array(all_inventory($1), (: userp($1) || playerp($1) || $1->is_chatter() ||
                                                                                   $1->is_item_make() && $1->is_stay_in_room() :))) :));
        if (! sizeof(rooms))
                return notify_fail("目前没有空的符合条件的聊天室。\n");

        for (i = 0; i < sizeof(rooms); i++)
        {
                write(rooms[i]->short() + "被拆除了。\n");
                destruct(rooms[i]);
        }

        return 1;
}

void clean_chat_room()
{
        object *rooms;

        remove_call_out("clean_chat_room");
        rooms = query_chat_room();
        rooms->clean_up();
        rooms -= ({ 0 });
        if (sizeof(rooms))
                call_out("clean_chat_room", 15 * 60);
}

int do_help(string arg)
{
        switch (arg)
        {
        case "here":
                write(@HELP
在这里你可以使用以下这些和聊天室相关的命令：
    enter        进入一个聊天室
    chathere     查阅这里的聊天室
    newchat      建立新的聊天室
HELP );
                break;

        case "enter":
                write(@HELP_ENTER
指令格式 : enter <聊天室ID>

此指令让你进入指定的聊天室，参与聊天，当然前提的保证你不是不
受欢迎的人物。

相关指令：chathere，newchat
HELP_ENTER );
                break;

        case "chathere":
                write(@HELP_CHATHERE
指令格式 : herechat

此指令让你查阅这里都有哪些聊天室，其中看上去是红色的表示你不
受欢迎，请勿入内。

相关指令：enter，newchat
HELP_CHATHERE );
                break;
        case "newchat":
                write(@HELP_NEW_CHAT
此指令让你自己建立一个聊天室，不过要有一定的条件即发呆神功满
十级才能够建立聊天室。

相关指令：enter，chathere
HELP_NEW_CHAT );
                break;

        case "clean":
                write(@HELP_CLEAN
清除目前没有人的聊天室。
HELP_CLEAN );
                break;

        default:
                return notify_fail("你要查看什么帮助？\n");
        }

        return 1;
}

void add_all_action()
{
        // add all action for this_player()
        add_action("do_enter", "enter");
        add_action("do_chathere", "chathere");
        add_action("do_newchat", "newchat");
        add_action("do_help", "help");
        add_action("do_clean", "clean");
}

