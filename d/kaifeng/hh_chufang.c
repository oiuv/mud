#include <ansi.h> 

inherit ROOM;

void create()
{
        set("short", "厨房");
        set("long", @LONG
这里是红花会总舵内的厨房。饭菜的香味充盈其间。几个
红花会的厨子满头大汗，正忙着做饭。如果你是红花会的弟子
不妨可以向他们要 (serve)点饭菜，相信不会被拒绝。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"hh_guangchang",
	]));
        set("objects",([
                __DIR__"npc/honghua2" : 1,
        ]));
        set("ricewater", 5);
        setup();
}

void init()
{
        add_action("do_serve","serve");
}

int do_serve()
{
        object me;
        object food;
        object water;
        me = this_player();

        if (me->query("family/family_name") != "红花会")
                return notify_fail(CYN "红花弟子道：你又不是红花会的，走开。\n" NOR);

        if (present("rice", this_player())) 
                return notify_fail(CYN "红花弟子道：吃完了再拿，别浪费食物。\n" NOR);

        if (present("soup", this_object())) 
                return notify_fail(CYN "红花弟子道：吃完了再拿，别浪费食物。\n" NOR);

        if (query("ricewater") > 0)
        {
                message_vision(CYN "红花弟子将热气腾腾的饭菜递到你手中，笑"
                               "道：你慢用。\n" NOR, me);
                food = new(__DIR__"obj/rice");
                water = new(__DIR__"obj/soup");
                food->move(me);
                water->move(me);
                add("ricewater", -1);
        }
        else 
                message_vision(CYN "红花弟子对$N" CYN "歉声道：嗨，吃的喝的都"
                               "没了。\n" NOR,me);
        return 1; 
}
