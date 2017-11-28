#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "厨房");
        set("long", @LONG
这是桃花岛的厨房，中央摆着大圆桌，周围则放着几张竹
椅。窗口还摆着几盆水仙花。你吸了一下鼻子，好香。也不知
是花香还是饭香。平时桃花岛的弟子和仆人都在这里用餐。看
着可口的饭菜，你忍不住也想叫(serve)一份。
LONG);
        set("exits",([
                "east" :__DIR__"qianyuan",
        ]));

        set("objects", ([
                __DIR__"npc/cheng" : 1,
                __DIR__"npc/yapu" : 1,
        ]));
        set("ricewater", 5);
        set("resource/water", 1);
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

        if (me->query("family/family_name") != "桃花岛")
                return notify_fail(CYN "程英微笑着说道：对不起，你不是岛上"
                                   "的弟子，我不能供饭。\n" NOR);

        if (present("gao", this_player())) 
                return notify_fail(CYN "程英笑着对你说道：喂！你吃完了再拿"
                                   "呀，可别浪费食物。\n" NOR);

        if (present("zuixian cha", this_object())) 
                return notify_fail(CYN "程英笑着对你说道：喂！你吃完了再拿"
                                   "呀，可别浪费食物。\n" NOR);

        if (query("ricewater") > 0)
        {
                message_vision(CYN "程英将热气腾腾的饭菜递到$N" CYN "手中"
                               "，笑道：你慢用。\n" NOR, me);
                food = new("/d/taohua/obj/gao");
                water = new("/d/taohua/obj/cha");
                food->move(me);
                water->move(me);
                add("ricewater", -1);
        }
        else 
                message_vision(CYN "程英对$N" CYN "歉声道：对不起，吃的喝"
                               "的都没了。\n" NOR, me);
        return 1; 
}
