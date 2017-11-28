#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "深潭");
        set("long", @LONG
你正好跌在舍身崖下深潭中。昏迷中醒来，四周黑蒙蒙什
么都看不清。潭水发着恶臭，偶尔还触及一两根不知是人是兽
的枯骨，让你全身直起鸡皮疙瘩。你漂浮在水中无助至极。情
急之下只有四处张望。
LONG);
        set("no_sleep_room",1);
        set("objects", ([
                __DIR__"npc/frog" : 1,
        ]));
        set("no_clean_up", 0);
        setup();
}

void init()
{
    	add_action("do_wang", "wang");
}

int do_wang()
{
    	object ob = this_player();

    	message_vision(HIC "\n$N" HIC "极目四望，发现还是有出路的，于"
                       "是求生试探之心大动。\n"NOR, ob);

    	switch (random(4))
    	{
        case 0 : set("exits/east", __DIR__"st1"); break;
        case 1 : set("exits/east", __DIR__"st2"); break;
        case 2 : set("exits/east", __DIR__"st1"); break;
        default: set("exits/east", __DIR__"st2");
        }
        switch (random(4))
        {
        case 0 : set("exits/west", __DIR__"st1"); break;
        case 1 : set("exits/west", __DIR__"st1"); break;
        case 2 : set("exits/west", __DIR__"st2"); break;
        default: set("exits/west", __DIR__"st2");
        }
        switch (random(4))
        {
        case 0 : set("exits/south", __DIR__"st2"); break;
        case 1 : set("exits/south", __DIR__"st2"); break;
        case 2 : set("exits/south", __DIR__"st1"); break;
        default: set("exits/south", __DIR__"st1");
        }
        switch (random(4))
        {
        case 0 : set("exits/north", __DIR__"st2"); break;
        case 1 : set("exits/north", __DIR__"st1"); break;
        case 2 : set("exits/north", __DIR__"st2"); break;
        default: set("exits/north", __DIR__"st1");
        }
        remove_call_out("close_out");
        call_out("close_out", 3);
        return 1;
}

void close_out()
{
    	if (query("exits/east"))
		delete("exits/east");

    	if (query("exits/west"))
		delete("exits/west");

    	if (query("exits/south"))
		delete("exits/south");

    	if (query("exits/north"))
		delete("exits/north");
}
