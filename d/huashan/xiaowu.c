// Room: /d/huashan/xiaowu.c

#include <room.h>
inherit ROOM;

void create()
{
        set("short", "林间小屋");
        set("long", @LONG
这里就是华山剑宗的的根本之地。二十五年来，剑宗弟子卧薪尝胆，
只是为了夺回华山门派掌门，为此，付出了极大牺牲。
    屋里陈设极为简陋，只是西面开了一个小门，上面挂着一道竹帘。
LONG );
        set("exits", ([ /* sizeof() == 4 */
             "west": __DIR__"pingdi",
             "east": __DIR__"neishi",
        ]));
        set("objects", ([
             CLASS_D("huashan") + "/feng-buping": 1,
        ]));
        set("valid_startroom", 1);

        setup();
        "/clone/board/jianzong_b"->foo();
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (! objectp(guarder = present("feng buping", this_object())))
                return 1;

        if (dir == "east")
                return guarder->permit_pass(me, dir);

        return 1;
}
