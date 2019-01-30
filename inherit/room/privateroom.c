// privateroom.c

// 凡是继承这种房屋类型的，都可以保存房屋的描述和房屋中autoload的物品。
// 保存数据的对象，继承者必须是/data/room/...目录下面的文件，此时它的
// 存盘文件的名字相同，后缀不同。
//
// KEY_DOOR如果有，将是大门的位置。

// #pragma save_binary

#include <ansi.h>

inherit ROOM;
inherit F_OBSAVE;
inherit F_AUTOLOAD;

int do_unlock(string arg);
int do_lock(string arg);
int do_break(string arg);
void this_open_door();
void this_close_door(int silent);
string query_save_file();

int is_private_room() { return 1; }

string room_owner_id()
{
        string rid;

        if (! stringp(rid = query("room_owner_id")))
        {
                if (sscanf(file_name(this_object()),
                           DATA_DIR "room/%s/%*s", rid) != 2)
                        return 0;
        }

        return rid;
}

int is_room_owner(object me)
{
        string rid;

        rid = room_owner_id();
	return (me->query("id") == rid || me->query("couple/id") == rid);
}

int restore()
{
        // this object (/inherit/room/privateroom) doesn't need to save
        if (base_name(this_object()) + ".c" == __FILE__)
                return 0;

        return ::restore();
}

int save()
{
	int res;

        // this object (/inherit/room/privateroom) doesn't need to save
        if (base_name(this_object()) + ".c" == __FILE__)
                return 0;

        this_close_door(1);
	save_autoload();
	res = ::save();
	clean_up_autoload();
	return res;
}

void setup()
{
        ::setup();
        restore();
	//restore_autoload();
}

// the callback function of F_OBSAVE
mixed save_dbase_data()
{
        mapping data;

        data = ([ "long" : query("long"),
                  "short" : query("short"),
                  "autoload" : this_object()->query_autoload_info() ]);

        if (! undefinedp(query("room_key")))
                data += ([ "room_key" : query("room_key") ]);

        return data;
}

// the callback function of F_OBSAVE
int receive_dbase_data(mixed data)
{
        if (! mapp(data))
                return 0;

        if (! undefinedp(data["long"]))
                set("long", data["long"]);

        if (! undefinedp(data["short"]))
                set("short", data["short"]);

        if (! undefinedp(data["room_key"]))
                set("room_key", data["room_key"]);

        if (! undefinedp(data["short"]))
                this_object()->set_autoload_info(data["autoload"]);

        return 1;
}

void remove()
{
        this_close_door(1);
        save();
}

void init()
{
        if (query("KEY_DOOR"))
        {
                add_action("do_knock", "knock");
                add_action("do_unlock", "unlock");
                add_action("do_lock", "lock");
                add_action("do_unlock", "open");
                add_action("do_lock", "close");
                add_action("do_break", "break");
        }

        add_action("do_kickout", "kickout");
}

int do_kickout(string arg)
{
        string entry;
        object me, ob;
        object oob;

        if (! arg)
                return notify_fail("你要把谁踢出去？\n");

        me = this_player();
        ob = find_player(arg);

        if (! objectp(ob))
                return notify_fail("你看谁不顺眼？\n");

        if (ob == me)
                return notify_fail("你大脑有水？\n");

        if (me->query("couple/id") == ob->query("id"))
        {
                if (me->query("gender") != "女性")
                        return notify_fail("不要乱打老婆。\n");
                else
                        return notify_fail("你干啥？这么凶悍。\n");
        }

        if (! is_room_owner(me))
                return notify_fail("你又不是这儿的主人，想干什么？\n");

        if (! query("no_fight"))
                return notify_fail("江湖上拳头大的说话，你何不施展出真实本领？\n ");

        if (me->query("couple/id") == query("room_owner_id"))
        {
                oob = UPDATE_D->global_find_player(room_owner_id());
                if (! objectp(oob))
                        return notify_fail("数据错误：无法查询玩家。\n");
                entry = oob->query("private_room/entry");
                UPDATE_D->global_destruct_player(oob);
        } else
                entry = me->query("private_room/entry");

        if (! stringp(entry))
                return notify_fail("数据错误：无法查询出口。\n");

        message_vision("$N大喝一声：“快给" + RANK_D->query_self_rude(me) +
                       "滚出去！”\n说罢，飞起一脚把$n咕噜咕噜的踢了出去！\n",
                       me, ob);
        ob->move(entry);
        message("vision", "只听一阵嘈杂，一人惨叫着从里面"
                          "飞了出来，重重的落到了地上。\n",
                environment(ob), ob);
        tell_object(ob, HIR "你只觉得浑身剧痛，骨头都麻了。\n" NOR);
        ob->receive_damage("qi", 150);
        if (! ob->is_busy())
                ob->start_busy(5);
        return 1;
}

int do_knock(string arg)
{
        object me;
        string exit;
        object room;

        if (! arg || arg != "men" && arg != "door")
                return notify_fail("你要敲什么？\n");

        if (stringp(exit = query("KEY_DOOR/exit")) &&
            query("exits/" + exit))
                return notify_fail("这里的门是开的，你敲它干什么。\n");

        if (! query("room_key"))
                return notify_fail("在这里开门又不用钥匙，你乱敲什么。\n");

        me = this_player();
        message_vision("$N走上前去，“笃笃笃”轻轻敲了几下门。\n", me);

        if (objectp(room = find_object(query("KEY_DOOR/room"))))
                message("vision", "“笃笃笃”的几声轻响，好像有人在外"
                        "面敲门。\n", room);

        return 1;
}

int do_unlock(string arg)
{
        object me;
        string exit;

        if (! arg || arg != "men" && arg != "door" && arg != "gate")
                return notify_fail("你要打开什么？\n");

        if (! stringp(exit = query("KEY_DOOR/exit")))
                return notify_fail("这里没有门需要打开。\n");

        if (query("exits/" + exit))
                return notify_fail("这里的门是开的，不必多此一举了。\n");

        me = this_player();
        if (stringp(query("room_key")))
        {
                if (! present(query("room_key"), me) )
                {
                        message("vison", me->name() + "鬼鬼祟祟的在门口搞了"
                                         "半天，不知道在干什么。\n",
                                         this_object(), ({ me }));
                        tell_object(me, "你费了半天劲，也没有打开锁，看来是"
                                        "钥匙不对。\n");
                        return 1;
                }

                message_vision("$N走到门前，摸出钥匙，轻轻一扭，啪的一声，"
                               "门开了。\n", me);
        } else
                message_vision("$N走到门前，轻轻一转打开了门。\n", me);

        this_open_door();
        return 1;
}

int do_lock(string arg)
{
        string exit;

        if (! arg || arg != "men" && arg != "door" && arg != "gate")
                return notify_fail("你要锁上什么？\n");

        if (! stringp(exit = query("KEY_DOOR/exit")))
                return notify_fail("这里没有门需要关上。\n");

        if (! query("exits/" + exit))
                return notify_fail("这里的门已经锁上了，不必多此一举了。\n");

        message_vision("$N随手一带门，“哐当”一声门锁上了。\n",
                       this_player());
        this_close_door(1);
        return 1;
}

int do_break(string arg)
{
        if (! arg || arg != "men" && arg != "door" && arg != "gate")
                return notify_fail("你要破坏什么？\n");

        if (is_room_owner(this_player()))
                return notify_fail("你有毛病啊？砸自己的门，要是"
                                   "没了钥匙配一把。\n");

        write("你胆子不小，居然敢擅闯民宅？\n");
        return 1;
}

void this_open_door()
{
        string exit;
        string room;
        object ob;

        if (! stringp(exit = query("KEY_DOOR/exit")))
                return;

        if (! stringp(room = query("KEY_DOOR/room")))
                return;

        set("exits/" + exit, room);

        if (! (objectp(ob = find_object(room))))
                 catch(ob = load_object(room));

        if (! ob) return;

        message("vision", "\n“卡啦”一声门从那边被人打开了。\n", ob);
        ob->set("exits/" + ob->query("KEY_DOOR/exit"),
                ob->query("KEY_DOOR/room"));

        remove_call_out("this_close_door");
        call_out("this_close_door", 10);
}

void this_close_door(int silent)
{
        string exit;
        string room;
        object ob;

        if (! stringp(exit = query("KEY_DOOR/exit")) ||
            ! query("exits/" + exit))
                return;

        if (! silent)
                message("vision", "\n一阵风吹来，“哐当”一声门关上了。\n",
                        this_object());
        delete("exits/" + exit);

        if (! (room = query("KEY_DOOR/room")))
                return;

        if (ob != find_object(room))
                 catch(ob = load_object(room));

        if (! ob) return;

        message("vision", "\n“哐当”一声门关上了。\n", ob);
        ob->delete("exits/" + ob->query("KEY_DOOR/exit"));
}

string query_save_file()
{
        string file;
        string arg;

        file = base_name(this_object());
        if (! file || ! sscanf(file, "/data/room/%s", arg)) return 0;

        return file;
}
