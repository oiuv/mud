inherit ROOM;

#include <ansi.h> 

void create()
{
        set("short","厨房");
        set("long",@LONG
这里是凌霄城的厨房。一阵饭菜的香味充盈其间。一个凌霄
弟子满头大汗，正在做饭。他做饭方法倒也特别，人绑在一根倒
吊的绳子上，用一个奇大的铲子来搅动一口极大的锅。听说是白
自在去少林寺考察回来后，要求每一个轮值做饭的弟子都要这样
干，利于练功云云……你可以用(serve)，来获得饭菜。
LONG);
        set("exits",([
                "west" : __DIR__"zoulang2",
        ]));
        set("objects",([
                __DIR__"npc/dizi" : 1,
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

        if (me->query("family/family_name") != "凌霄城")
                return notify_fail(CYN "凌霄弟子道：你又不是凌霄城的，走开。\n" NOR);

        if (present("rice", this_player())) 
                return notify_fail(CYN "凌霄弟子道：吃完了再拿，别浪费食物。\n" NOR);

        if (present("soup", this_object())) 
                return notify_fail(CYN "凌霄弟子道：吃完了再拿，别浪费食物。\n" NOR);

        if (query("ricewater") > 0)
        {
                message_vision(CYN "凌霄弟子将热气腾腾的饭菜递到你手中，笑"
                               "道：你慢用。\n" NOR, me);
                food = new(__DIR__"obj/rice");
                water = new(__DIR__"obj/soup");
                food->move(me);
                water->move(me);
                add("ricewater", -1);
        }
        else 
                message_vision(CYN "凌霄弟子对$N" CYN "歉声道：嗨，吃的喝的都"
                               "没了。\n" NOR,me);
        return 1; 
}

