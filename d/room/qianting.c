// qianting.c 盘龙居前庭

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
//**    object ob;

	set("short", "前庭");             /* EXAMPLE */
//**    set("short", "ROOM_NAME前庭");
	set("long", @LONG
这里似乎非常安静，倒是时不时听见鸟儿唧唧喳喳的叫。院中不少树
木已然有遮天之势，肃穆非常。
LONG );

	set("default_long", "这里似乎非常安静，听不到什么声响，到是时不" /* EXAMPLE */
                            "时听见鸟儿唧唧喳喳的叫。院中不少树木已然有" /* EXAMPLE */
                            "遮天之势，肃穆非常。");                     /* EXAMPLE */
                                                                         /* EXAMPLE */

	set("exits", ([
                "south"  : __DIR__"dayuan",
                "east"   : __DIR__"zuowei",
                "west"   : __DIR__"youwei",
	]));

//**    set("objects", ([
//**            "/d/room/roomnpc/laopu" : 1,
//**    ]));

        set("outdoors", "OUTDOORS");
        set("no_sleep_room", 1);
        set("gate", "close");
        setup();

//**    ob = present("saodi laopu", this_object());
//**    ob->set("coagents", ({
//**            ([ "startroom" : __DIR__"zuowei",
//**               "id"        : "shou wei 2" ]),
//**            ([ "startroom" : __DIR__"zuowei",
//**               "id"        : "shou wei 1" ]),
//**            ([ "startroom" : __DIR__"youwei",
//**               "id"        : "shou wei 2" ]),
//**            ([ "startroom" : __DIR__"youwei",
//**               "id"        : "shou wei 1" ]),
//**    }));

//**    set("room_owner", "ROOM_OWNER");
//**    set("room_name", "ROOM_NAME");
//**    set("room_id", "ROOM_ID");
//**    set("room_owner_id", "ROOM_OWNER_ID");
//**    set("room_position", "ROOM_POSITION");
}

void init()
{
        add_action("do_push", "push");
        add_action("do_close", "close");
}

int do_push()
{
        object ob;
        object me;
        object room;

        if (query("gate") == "open")
                return notify_fail("大门开着呢，你还推什么？\n");

        me = this_player();
        ob = present("saodi laopu", this_object());
        if (me && (! ob || ! living(ob) || ob->is_owner_permit(me)))
        {
                message_vision("$N用力一推大门，就听见大门“吱呀呀”的开了。\n",
                               me);
        } else
        if (me && ! ob->is_owner(me))
        {
                message_vision("$N伸手拦住$n，客客气气道：“对不起，这位" +
                               RANK_D->query_respect(me) + "还是请回"
                               "吧！”\n", ob, me);
                return 1;
        } else
        if (ob && living(ob))
        {
                message_vision("$n连忙跑上前来，对$N道：“主人何必亲"
                        "劳，我来吧！”\n$n走上前去，用力将大门“吱呀"
                        "呀”的推开了。\n", me, ob);
        } else
        {
                message("vision",  "大门“吱呀呀”的被人打开了。\n",
                        this_object());
        }

        room = get_object(__DIR__"zoudao");
        message("vision", "大门“吱呀呀”的被人推开了。\n", room);
        set("gate", "open");
        set("exits/north", __DIR__"zoudao");
        room->set("exits/south", __FILE__);
        room->set("gate", "open");
        remove_call_out("do_close");
        call_out("do_close", 10, 0, 1);
        return 1;
}

int do_close(string arg, int n)
{
        object ob;
        object me;
        object room;

        if (query("gate") == "close")
                return notify_fail("大门关着呢，你还再关一遍？\n");

        me = this_player();
        ob = present("saodi laopu", this_object());
        if (! n && me && (! ob || ! living(ob)))
        {
                message_vision("$N用力一拉大门，就听见大门“吱呀呀”的关上了。\n",
                               me);
        } else
        if (! n && me && ! ob->is_owner(me))
        {
                message_vision("$N走上前去，用力合上大门。\n", me);
        } else
        if (! n && me && ob->is_owner(me))
        {
                message_vision("$n连忙跑上前来，对$N道：“主人何必"
                        "亲劳，我来吧！”\n$n走上前去，用力合上大门。\n",
                        me, ob);
        } else
        if (ob && living(ob))
        {
                message("vision", ob->name() + "走上前去，用力合上大门。\n",
                        this_object());
        } else
        {
                message("vision", "大门“吱呀呀”的被人关上了。\n",
                        this_object());
        }

        room = get_object(__DIR__"zoudao");
        message("vision", "大门“吱呀呀”的被人关上了。\n", room);
        set("gate", "close");
        delete("exits/north");
        room->delete("exits/south");
        room->set("gate", "close");
        return 1;
}

string long()
{
        string msg;
        msg = "    ";
        if (present("lao jiaren"))
                msg += "一老家人慢慢的挥舞着扫把，打扫着落叶。";

        if (query("gate") != "open")
                msg += "向北望去，有一扇大门紧紧的关闭着。";
        else
                msg += "大门畅开，远远望去，隐然可见迎客厅。";

        return query("long") + sort_string(msg, 60, 0);
}

int valid_leave(object me, string dir)
{
        object ob;

        ob = present("saodi laopu", this_object());
        if (dir != "north" || ! objectp(ob) || ! living(ob))
                return ::valid_leave(me, dir);

        if (ob->is_owner(me))
        {
                message_vision("$N弯腰对$n道：“请进！”\n", ob, me);
                return ::valid_leave(me, dir);
        }

        if (ob->is_owner_permit(me))
        {
                message_vision("$N对$n道：“即然是主人的朋友，但进无妨。”\n",
                               ob, me);
                return ::valid_leave(me, dir);
        }

        message_vision("$N伸手拦住$n，道：“非请莫入！”\n", ob, me);
        return 0;
}
