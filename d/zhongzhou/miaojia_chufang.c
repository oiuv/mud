#include <ansi.h>

inherit ROOM;

void create()
{
	set("short", "厨房");
	set("long", @LONG
这里是苗家大院北侧的一间厨房，平常苗家的弟子们饿了
便可以到这里来要 (serve)些食物。房中灶火正旺，一个大厨
师正忙的满头大汗。屋角放着一个大水缸。  
LONG);
	set("exits", ([
  		"south" : __DIR__"miaojia_dayuan",
	]));
	set("no_clean_up", 0);
        set("objects", ([
                __DIR__"npc/chushi" : 1,
        ]));
        set("ricewater", 5);
	setup();
}

void init()
{
        add_action("do_serve", "serve");
}

int do_serve()
{
        object me;
        object food;
        object water;
        me = this_player();

        if (me->query("family/family_name") != "中原苗家")
                return notify_fail(CYN "厨师大眼一瞪，说道：你又不是苗家的，吃白食啊？\n" NOR);

        if (present("rice", this_player())) 
                return notify_fail(CYN "厨师眉头一皱，说道：吃完了再拿，别浪费食物。\n" NOR);

        if (present("soup", this_object())) 
                return notify_fail(CYN "厨师眉头一皱，说道：吃完了再拿，别浪费食物。\n" NOR);

        if (query("ricewater") > 0)
        {
                message_vision(CYN "厨师将热气腾腾的饭菜递到你手中，笑"
                               "道：你慢用。\n" NOR, me);
                food = new("/d/kaifeng/obj/rice");
                water = new("/d/kaifeng/obj/soup");
                food->move(me);
                water->move(me);
                add("ricewater", -1);
        }
        else 
                message_vision(CYN "厨师对$N" CYN "歉声道：嗨，吃的喝的都"
                               "没了。\n" NOR,me);
        return 1; 
}
