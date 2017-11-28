// shufang.c 御书房

#include <room.h>
inherit ROOM;

int do_press(string arg);


void create()
{
        set("short", "御书房");
        set("long", @LONG
皇上用功读书的御书房.四下齐整地排着几排书架,看来都是些名典
巨著,你暗自道,原来皇上也读这么多书啊.书房正中有张精雕的檀香木
桌(desk),桌上摆着几本封面精美的帛书.
LONG
        );
        set("exits", ([
                "south" : __DIR__"tinglang1",
		]));
        set("item_desc", ([
				"desk" : "一张制作精良的檀香木书桌.\n",
        ]));
        set("objects", ([
//        __DIR__"npc/kangxi" : 1,
        ]));
        setup();
}

void init()
{
        add_action("do_press", "press");
}

int do_press(string arg)
{
        if( !arg || arg=="") return 0;
        if( arg=="desk")
        {
                message_vision("你轻轻一按桌角,突然墙上书架列开一道暗门.\n", this_player());
                set("exits/enter", __DIR__"mishi");
				remove_call_out("close");
                call_out("close", 1, this_object());
                return 1;
        }
}

void close(object room)
{
        message_vision("吱呀一声,暗门又合上了.\n", room);
        room->delete("exits/enter");
}
