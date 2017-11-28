#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "膳堂");
        set("long", @LONG
这里是全真教的膳堂，是弟子们用餐的地方。这个堂很大
整齐地摆放着一排一排的桌椅。现在桌椅上三三两两地坐着全
真弟子，有的正在用餐，有的低头谈笑。看着可口的饭菜，你
忍不住也想叫(serve)一份。
LONG);
        set("exits",([
                "north" : __DIR__"xiuxishi",
                "east" : __DIR__"chufang",
                "northwest" : __DIR__"wuchang2",
        ]));
        set("objects", ([
                __DIR__"npc/huogong" : 1,
        ]));
        set("ricewater", 5);
        set("no_clean_up", 0);
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

        if (me->query("family/family_name") != "全真教")
                return notify_fail(CYN "火工道人大眼一瞪，说道：你是哪来的，敢"
                                   "来混饭吃！\n" NOR);

        if (present("rice", this_player())) 
                return notify_fail(CYN "火工道人眉头一皱，说道：吃完了再拿，别"
                                   "浪费食物。\n" NOR);

        if (present("wan", this_object())) 
                return notify_fail(CYN "火工道人眉头一皱，说道：吃完了再拿，别"
                                   "浪费食物。\n" NOR);

        if (query("ricewater") > 0)
        {
                message_vision(CYN "火工道人将热气腾腾的饭菜递到你手中，笑"
                               "道：你慢用。\n" NOR, me);
                food = new(__DIR__"obj/rice");
                water = new(__DIR__"obj/bowl");
                food->move(me);
                water->move(me);
                add("ricewater", -1);
        }
        else 
                message_vision(CYN "火工道人对$N" CYN "歉声道：嗨，吃的喝的都"
                               "没了。\n" NOR,me);
        return 1; 
}
