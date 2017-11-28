inherit ROOM;

void create()
{
        set("short", "半山亭");
        set("long", @LONG
终于到了半山亭。这里离到祝融峰无论高程还是行程，均
恰好是一半之径，路边小亭显然已极古久，但仍为过往客旅遮
风避雨。
LONG);

        set("exits", ([
               "southdown"  : __DIR__"shanlu4",
               "northwest"    : __DIR__"shanlu002",
        ]));

        set("no_clean_up", 0);
        set("outdoors", "henshan");

        setup();
        replace_program(ROOM);
}

