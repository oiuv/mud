inherit ROOM;

void create()
{
        set("short", "帕米尔高原");
        set("long", @LONG
翻过天山顶峰，便来到帕米尔高原。真是天外有天，你仿
佛来到另一个世界。这儿冰雪消融，春意盎然。从那雪峰直垂
下来的溪涧里，长满了野果树。山风习习，空气清凉如水。山
花烂漫, 几里地外也能闻到馥郁的花香。
LONG);
        set("outdoors", "shenfeng");
        set("exits", ([
            "southdown" : __DIR__"huijiang2",
        ]));

        set("objects", ([
                "clone/quarry/lang"  : 1,
        ]));

        set("quarrys", ([
                "gou"   : 100000,
                "lang"  : 80000,
                "lang2" : 50000,
        ]));

        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
