#include <ansi.h>
#include <room.h>
inherit ROOM;

void create()
{
        set("short", "老宅后院");
        set("long", @LONG
这里是向阳老宅的后院。满地是发出朽烂霉气的落叶。院
子的中央有一口井，井台上刻着些字。院子南面有一扇门，但
已被坍塌的砖瓦挡住了。
LONG );
        set("exits", ([
            	"west" : __DIR__"mishi",
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
                set("exits/south", __DIR__"laozhai");
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
        delete("exits/south");
        delete("break");
}
