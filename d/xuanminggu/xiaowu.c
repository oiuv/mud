// Room: xiuxishi.c 休息室
// By rcwiz

inherit ROOM;

void create()
{
        set("short", "休息室");
        set("long", @LONG
这里是玄冥谷中的一间茅草屋，供平时休息之用。此处虽
然简陋了点，但也还算景色宜人，比之豪华的卧房更有一分清
新脱俗的感觉。
LONG );
        set("no_clean_up", 0);
        set("sleep_room", 1);
        set("no_fight", 1);

        set("exits", ([
                "out" : __DIR__"xuanminggu",
        ]));
        setup();
        replace_program(ROOM);
}



