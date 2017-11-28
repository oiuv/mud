// yingke.c 盘龙居迎客厅

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
	set("short", "走道");
	set("long", @LONG
这是连接正厅和大门的一条走道，两旁都是木制墙板，前面就是
迎客厅。
LONG );

	set("default_long", "这是连接正厅和大门的一条走道，两旁都是木" /* EXAMPLE */
                            "制墙板，前面就是迎客厅。" );              /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
		"north"  : __DIR__"yingke",
                "south"  : __DIR__"qianting",
	]));

        set("gate", "close");

//**    set("objects", ([
//**            "/d/room/roomnpc/yahuan" : 1,
//**    ]));

        set("no_sleep_room", 1);
        setup();

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

int do_push(string arg)
{
        object me;
        object room;

        if (query("gate") == "open")
                return notify_fail("大门开着呢，你还推什么？\n");

        me = this_player();
        message("vision",  "你用力推了推大门，就听大门“吱呀呀”的被人推开了。\n",
                           this_object());
    
        room = get_object(__DIR__"qianting");
        message("vision", "大门“吱呀呀”的被人推开了。\n", room);
        set("gate", "open");
        set("exits/south", __DIR__"qianting");
        room->set("exits/north", __FILE__);
        room->set("gate", "open");
        remove_call_out("do_close");
        call_out("do_close", 10, 0, 1);
        return 1;
}

int do_close(string arg, int n)
{
        object me;
        object room;

        if (query("gate") == "close")
                return notify_fail("大门关着呢，你还再关一遍？\n");

        if (! n)
        {
                me = this_player();
                message("vision", me->name() + "走上前去，用力合上大门。\n",
                        this_object());
        } else
        {
                message("vision", "大门“吱呀呀”的被人关上了。\n",
                        this_object());
        }

        room = get_object(__DIR__"qianting");
        message("vision", "大门“吱呀呀”的被人关上了。\n", room);
        set("gate", "close");
        delete("exits/south");
        room->set("gate", "close");
        room->delete("exits/north");
        return 1;
}

