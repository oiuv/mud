#include <ansi.h>
inherit ROOM;

void create()
{
        set("short",  "王俯大门" );
        set("long", @LONG
这里便是云南平西王俯的大门，两边个有一个威武的大石
狮子，高大的朱漆大门紧紧的闭着，几个亲兵严密的注视着来
往的人，没什么事，最好别在这里溜达。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "south"    :__DIR__"beidajie",
                "north"   :__DIR__"wangfu1",
        ]));

        set("objects",([
                __DIR__"npc/qinbing":4,
        ]));
        setup();
}

int valid_leave(object me, string dir)
{
        if (dir == "north" &&
           objectp(present("qin bing", environment(me))))
                return notify_fail(CYN "亲兵拦住你说道：王府大院，闲杂人"
                                   "等一律回避。\n" NOR);                
        return ::valid_leave(me, dir);
}
