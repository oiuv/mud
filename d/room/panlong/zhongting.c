// zhongting.c 盘龙居中庭

#include <room.h>

//** inherit PRIVATE_ROOM;
inherit ROOM;                                   /* EXAMPLE */

void create()
{
//**    object ob;

	set("short", "中庭");             /* EXAMPLE */
//**    set("short", "ROOM_NAME中庭");
	set("long", @LONG
这是盘龙居之腰：中庭，两旁便是客人居住的厢房，后面通往后
花园和主人居所，前面则是议事厅，一直通往大院。
LONG );

	set("default_long", "这是ROOM_NAME之腰：中庭，两旁便是客人居"  /* EXAMPLE */
                            "住的厢房，后面通往后花园和主人居所，前面" /* EXAMPLE */
                            "则是议事厅，一直通往大院。");             /* EXAMPLE */
                                                                       /* EXAMPLE */

	set("exits", ([
		"north"  : __DIR__"houyuan",
                "south"  : __DIR__"yishiting",
                "east"   : __DIR__"zuoxiang",
                "west"   : __DIR__"youxiang",
	]));

        set("outdoors", "OUTDOORS");

//**    set("objects", ([
//**            "/d/room/roomnpc/shouwei" : 1,
//**    ]));

        create_door("east", "木门", "west", DOOR_CLOSED);
        create_door("west", "木门", "east", DOOR_CLOSED);

        set("no_sleep_room", 1);
        setup();

//**    ob = present("shou wei", this_object());
//**    ob->set("coagents", ({
//**            ([ "startroom" : __DIR__"zuowei",
//**               "id"        : "shou wei 1" ]),
//**            ([ "startroom" : __DIR__"zuowei",
//**               "id"        : "shou wei 2" ]),
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

int valid_leave(object me, string dir)
{
        object ob;

        ob = present("shou wei", this_object());
        if (dir != "north" || ! objectp(ob) || ! living(ob))
                return ::valid_leave(me, dir);

        if (ob->is_owner(me))
        {
                message_vision("$N弯腰对$n道：“请进！”\n", ob, me);
                return ::valid_leave(me, dir);
        }

        if (present(query("room_owner_id") + " pass", me))
        {
                message_vision("$N对$n道：“即然有主人的手谕，就请进吧。”\n",
                               ob, me);
                return ::valid_leave(me, dir);
        }

        message_vision("$N伸手拦住$n，道：“对不起，没有" +
                       query("room_owner") + "的手谕，不可擅自闯入！”\n", ob, me);
        return 0;
}
