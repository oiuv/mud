// shanbi.c
#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "山壁");
        set("long", @LONG
这里是华山绝壁上的山壁。山壁似乎有个山洞(dong)。你向下一
望，只见脚下雾气一团团的随风飘过，绝峰险岭，却不看见地。转头
向洞里张望，黑沉沉的看不清楚，只觉得洞穴很深。洞口甚小，那是
钻不进去。
LONG );
        set("outdoors", "jinshe");
        set("exits", ([ /* sizeof() == 2 */
            "up" : "/d/huashan/ziqitai",
        ]));
        set("item_desc", ([
            "dong" : "一个被烂泥堵住的山洞，不知道能不能打破（break）。\n"
        ]) );
        set("no_clean_up", 0);
        setup();
}

void init()
{
        add_action("do_break", "break");
}
int do_break(string arg)
{
//      int n;
        object /*weapon,*/me=this_player();
        if (arg != "dong") return 0;
        message_vision(HIY
"$N走到洞口前，运气双掌，猛地击向土层！\n"NOR,me);

        if (me->query("neili") < 100)
        {
               message_vision(HIY
"结果只听一声闷哼，$N被土层的反弹力震得眼前一黑....\n"NOR,me);
               me->set("neili",0);
               me->unconcious();
               return 1;
        }
        message_vision(HIY
"$N只听一声轰响，土层被捅穿了，原来里面有一个大洞！\n"NOR,me);
        set("exits/enter",__DIR__"yongdao1");
        me->add("neili",-200);
        remove_call_out("close");
        call_out("close", 5, this_object());
        return 1;
}

void close(object room)
{
    message("vision","崖上忽然掉下来一块大土块，将洞口封了个严严实实。\n", room);
    room->delete("exits/enter");
}