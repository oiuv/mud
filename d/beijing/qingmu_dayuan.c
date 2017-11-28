#include <room.h>
inherit ROOM;

void create()
{
        set("short", "大院");
        set("long", @LONG
一个杂草丛生的四合院院子，大院北边是一条黑漆漆的胡同，四周是几间
房屋，房屋也不怎么破旧。院中横七竖八的倒着一些石锁、铁环等寻常百姓健
身用的器材。一个道人站在大院的正中，虎视耽耽的盯着你。
LONG );
       set("exits", ([
                "north" : __DIR__"qingmu_men",
                "south" : __DIR__"qingmu_fang2",
                "east" : __DIR__"qingmu_fang1",
                "west" : __DIR__"qingmu_fang3",
        ]));
        set("objects", ([
                CLASS_D("yunlong") + "/xuanzhen" : 1
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}

