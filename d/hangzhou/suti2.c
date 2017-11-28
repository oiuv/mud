#include <room.h>
inherit ROOM;

void create()
{
        set("short", "苏堤");
        set("long", @LONG
苏堤上，游客们有的林荫大道上漫步吟诗，高谈阔论；有的随机
就石，临水而坐；有的伶立湖边，静享湖景。北边是跨虹桥，南面是
东浦桥，东面是去曲园风荷。
LONG);
        set("exits", ([
            "north"     : __DIR__"suti1",
            "south"     : __DIR__"suti3",
            "east"      : __DIR__"quyuanbei",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("no_clean_up", 0);
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
