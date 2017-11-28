// Room: /d/wanjiegu/wlshan.c

inherit ROOM;

void create()
{
        set("short", "无量山");
        set("long", @LONG
这里就是无量山区。山上树木丛生，很少有人走动，你都无法
找到一条能够上山的路。沿着山脚有一条蜿蜒的小路。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 2 */
                "northwest" : __DIR__"wlroad1",
                "southeast" : __DIR__"riverside4",
        ]));

        setup();
        replace_program(ROOM);
}
