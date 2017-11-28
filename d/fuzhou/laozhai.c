#include <room.h>
#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "向阳老宅");
        set("long", @LONG
这里是福威镖局总镖头林震南在福建的旧居。室内的家具
横七竖八地倒在地上，把通向后院的门(men)都挡住了。房间
的一角结着一张蜘蛛网，屋里到处是尘土，显然是已经很久没
有人住了。
LONG);
        set("exits", ([
                "south" : __DIR__"xiangyang",
        ]));
        set("item_desc", ([
                "men" : "这扇门已被挡住无法通行，除非你打破(break)它。\n",
        ]) );
        setup();
}

void init()
{
        add_action("do_break", "break");
}

int do_break(string arg)
{
        int n = this_player()->query("neili");

        if (query("break"))
                return notify_fail("大门已经被震开，用不着再费力了。\n");

        if (! arg || arg != "men")
        {
                write("什么？\n");
                return 1;
        }

        message_vision(HIY "$N" HIY "走到后门前，拜出骑马蹲裆式，深吸一"
                       "口气，双掌同时拍出。\n" NOR, this_player());
        
        if (n >= 200)
        {
                message_vision(WHT "只听轰然一声巨响，$N" WHT "把门给震"
                               "开了。\n" NOR, this_player());
                set("exits/north", __DIR__"houyuan");
                set("break", 1);
                this_player()->set("neili", n-200);
                remove_call_out("close");
                call_out("close", 5);
        } else
        {
                message_vision(HIY "$N" HIY "大吼一声“开！”，双掌同时"
                               "向门拍去。\n" HIR "结果大门被震得砰的一"
                               "声，灰尘四处飞扬。\n" NOR, this_player());
                this_player()->set("neili", 0);
        }
        return 1;
}

void close()
{
        message("vision", WHT "门上的砖头瓦块稀里花拉坍塌下来，又挡住了"
                          "小门。\n" NOR, this_object());
        delete("exits/north");
        delete("break");
}
