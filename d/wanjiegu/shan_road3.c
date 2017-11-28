// Room: /t/wanjiegu/shan_road3.c

inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这是一条山间小路，两边山坡上张了许多树木，北风吹过，发
出沙沙的响声。路上张着许多杂草，看起来这里很少有人走动。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 2 */
            "eastup" : __DIR__"shan_road2",
            "northdown" : __DIR__"shan_road4",
        ]));
        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
