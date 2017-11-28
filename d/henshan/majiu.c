#include <room.h>
inherit TRANS_ROOM;

void create()
{
      set("short","马厩");
      set("long",@LONG
这是衡阳城南的马厩，常年供应新鲜草料。衡阳地狭人稀
来往行人也很少。从这里可以乘马车到附近的城市，马厩雨檐
下的烂木柱上钉着一块破木牌(paizi)。 马厩中堆放著几堆草
料，正中有一口泔槽。
LONG);
        set("outdoors", "henshan");
        set("no_fight", 1);

        set("objects", ([
                "/clone/horse/zaohongma": 1,
                "/clone/horse/huangbiaoma": 1,
                "/clone/horse/ziliuma": 1,
                "/clone/npc/mafu": 1,
        ]));

        set("exits",([
               "north" : __DIR__"hengyang11",
                "up"   : "/clone/shop/hengyang_shop",
        ]));

        setup();
        replace_program(TRANS_ROOM);
}

