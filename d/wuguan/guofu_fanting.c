#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "饭厅");
        set("long", @LONG
这里是武馆内用餐的地方。屋里布置很简单, 只摆着几张
桌椅几个人在一声不响地吃着。一个厨子在不停的忙碌着，你
可以向他要(serve)食物和水。
LONG);
        set("exits", ([
                "east" : __DIR__"guofu_shilu-4",
        ]));

        set("objects", ([
          	__DIR__"npc/chushi" : 1,
        ]));       
        set("no_fight", 1);
        setup();
}

int valid_leave(object me, string dir)
{
        if ((dir == "east")
           && present("chu shi", environment(me)))
	{
	        if (present("tea", me))
              		return notify_fail(CYN "厨师拦住你道：你还是先把茶"
                                           "喝完再走吧。\n" NOR);

	        if (present("rice", me))
              		return notify_fail(CYN "厨师拦住你道：你还是先把饭"
                                           "吃完再走吧。\n" NOR);

        }
        return ::valid_leave(me, dir);
}
