#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "藏经楼");
        set("long", @LONG
这里是报国寺藏经楼。阁楼上密密麻麻排了好多书架，架
上摆满了经书。有两个身穿白衣的小师太正在一角静静地读着
经书。
LONG);
        set("objects", ([
                CLASS_D("emei") + "/daoming" : 1,
                __DIR__"obj/fojing1" + random(2) : 1,
                __DIR__"obj/fojing2" + random(2) : 1,
        ]));
        set("exits", ([
                "south" : __DIR__"dxdian",
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        me = this_player();

        if (dir == "south"
           && present("shu", me)
           && objectp(present("dao ming", environment(me))))
                return notify_fail(CYN "道明小师父见你想把经书拿走，上前轻"
                                   "声说道：本阁经书恕不外借。\n" NOR);

        return ::valid_leave(me, dir);
}
