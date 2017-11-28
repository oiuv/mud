// Room: /d/xiakedao/xkroad5.c
// Modified by Java on Feb.14.1998

#include <ansi.h>

inherit ROOM;

void create()
{
	set("short", "渔港");
	set("long", @LONG
这里是个小小渔港。南面海面漂浮着几艘小船，抬眼望，海天相
连，无边无际。海鸥掠过浪尖，悠悠翩然。有几个渔夫懒洋洋的呆在
海边，附近停泊了一些小船(boat)。
LONG );
        set("outdoors", "nanhai");

	set("exits", ([
		"east" : __DIR__"xkroad4",
	]));

	set("objects", ([
		__DIR__"npc/renter" : 1,
	]));

        set("item_desc", ([
                "boat" : "这艘船可到侠客岛。\n",
        ]));

        set("no_fight", 1);

	setup();
}

void init()
{
        add_action("do_enter", "enter");
}

int do_enter(string arg)
{
        object ob, lingpai;
//      string dir;

        if (arg != "boat")
                return notify_fail("你要去哪儿？\n" );

        ob = this_player();

        if (! lingpai = present("shangfa ling", ob))
                return notify_fail(HIC "船夫说道：“你没有赏善罚恶令，不能到侠客岛去！\n" NOR);

        message_vision(HIG "船夫点了点头道：“既然阁下有赏善罚恶令，我就送你到侠客岛去！”\n" NOR, ob);
        
        destruct(lingpai);

        message_vision("船夫一见有人上船，忙叫了一声：开船喽！\n", ob);
        message_vision("船夫升起帆，船就向南方航行。\n", ob);
        
        ob->move("/d/xiakedao/duchuan");
        tell_object(ob, BLU "你在海上航行了一整天.......\n" NOR ) ;
        call_out("home", 7, ob);
        return 1;
}

void home(object ob)
{
        if (! objectp(ob))
                return;

        tell_object(ob, "大船终于抵达了南海岸边。你走下船来。\n");
        ob->move (__DIR__"haitan");
        message("vision", ob->name() + "下了小舟，走了过来。\n",
                environment(ob), ob);
}