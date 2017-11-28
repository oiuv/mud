// Room: /t/wanjiegu/port2.c

inherit ROOM;

void create()
{
        set("short", "澜沧江畔");
        set("long", @LONG
这里是一个小山坡，西面是上山的路，东面一条铁索桥横跨江
面，只见江水奔腾，呼啸而过，江风吹得铁索桥晃来晃去。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 2 */
            "westup" : __DIR__"slide3",
            "east" : __DIR__"bridge",
        ]));

        setup();
        replace_program(ROOM);
}
