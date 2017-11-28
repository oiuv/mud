// Room: /d/quanzhou/chiqian.c
// Date: May 7, 96   Jay

#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "赤嵌城");
	set("long", @LONG
此地为台湾府驻所。台湾开化未久，国姓爷东征，收
复此城，围困红毛鬼达两年之久，终致金瓯无缺。
    城外海港，有舟(zhou)船来往澎湖。
LONG );
	set("exits", ([
                "eastup" : __DIR__"riyuetang",
                "north"  : __DIR__"jilong",
                "south"  : __DIR__"dagou",
	]));
	set("item_desc", ([
                "zhou" : "一条兵舟，往返澎湖的交通兵船。\n",
	]));
	set("objects", ([
		__DIR__"npc/hongmao": 1,
	]));
	set("outdoors", "quanzhou");
	setup();
}

void init()
{
        add_action("do_enter", "enter");
}

int do_enter( string arg)
{
        object ob;
        string dir;

        ob = this_player();
        if (arg !="zhou")
        {
                tell_object(this_player() , "你要 enter 哪儿？\n");
                return 1;
        }

        message_vision("水兵一见有人上船，忙叫了一声：开船喽！\n", ob);
        message_vision("水兵升起帆，船就向西方航行。\n", ob);
        ob->move(__DIR__"dahai");
        tell_object(ob, BLU "你在海上航行了很久很久.......\n" NOR);
        call_out("tpenghu", 10 , ob);
        return 1;
}

void tpenghu(object ob)
{
        if (! objectp(ob) || find_object(__DIR__"dahai") != environment(ob))
                return;

        tell_object(ob, "兵舟终于抵达了海峡中一个大岛。你走下船来。\n");
        ob->move(__DIR__"penghu");
}
