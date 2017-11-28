#include <ansi.h>
#include <room.h>
inherit ROOM;

string look_hua();
int valid_leave(object me, string dir);

void create()
{
        set("short", "鳌拜书房");
        set("long", @LONG
这里是鳌拜书房，却没有一本书。各种古玩琳琅满目，商
周青铜、汉瓦当、唐三彩，珍珠宝石，应有尽有，只要拥有其
中一件，就够你吃一辈子了。北面墙上有一副画(hua)。
LONG);

        set("exits", ([
                "east" : __DIR__"aofu_zoulang3",
        ]));
        set("item_desc", ([
                "hua" : (: look_hua :),
        ]));
        setup();
}

void init()
{
        add_action("do_xian", "xian");
        add_action("do_turn", "turn");
}

string look_hua()
{
        object me = this_player();

        if (me->query("score") < 3000)
                return WHT "\n这是一幅陈旧的画卷，没有"
                       "什么不同。\n" NOR;

        me->set_temp("marks/画1", 1);
        return WHT "\n这是一幅陈旧的画卷，画中一处微微"
               "隆起，你忍不住便想掀开看看。\n" NOR;
}

int do_xian(string arg)
{
        object me = this_player();

        if (! arg || arg != "hua")
                return 0;

        if (! me->query_temp("marks/画1"))
                return 0;

        write(HIC "\n你掀开画卷，发现后面竟隐藏着一个把"
              "手，似乎可以转动。\n" NOR);
        me->set_temp("marks/画2", 1);
        return 1;
}

int do_turn(string arg)
{
        object me = this_player();

        if (! arg || arg != "bashou")
                return 0;

        if (! me->query_temp("marks/画2"))
                return 0;

        if (query("exits/down"))
                return notify_fail("你拉了拉把手，但似乎没什么作用。\n");

        message_vision(HIY "\n$N" HIY "拉了拉把手，地面忽然「喀"
                       "喀喀」现出一个洞口。\n\n" NOR, me);
        set("exits/down", __DIR__"aofu_mishi");
        remove_call_out("close");
        call_out("close", 8, this_object());

        return 1;
}

void close(object room)
{
        message("vision", WHT "地面忽然「喀喀喀」缩回原地，把密道的入口挡"
                          "住了。\n" NOR, room);
        room->delete("exits/down");
}

int valid_leave(object me, string dir)
{
        me->delete_temp("marks/画1");
        me->delete_temp("marks/画2");
        return ::valid_leave(me, dir);
}
