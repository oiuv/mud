// Room: /d/wanjiegu/wlroad2.c

inherit ROOM;

void create()
{
        set("short", "小路");
        set("long", @LONG
这里长满了杂草，到处都是灌木。树木遮天蔽日，偶然有一些
小动物突然串出，有飞快的跑开。地处偏僻，十分幽静。
LONG
        );
        set("outdoors", "wanjiegu");
        set("exits", ([ /* sizeof() == 2 */
                "southwest" : __DIR__"wlhoushan",
                "east"      : __DIR__"wlroad1",
        ]));

        setup();
        replace_program(ROOM);
}
