inherit ROOM;

void create()
{
        set("short", "后院");
        set("long", @long
这是庄主平时练功的地方，在这绝顶寒峰，几乎寸草不生，
只有几棵苍松挺立在那里。院内有一张石桌和几张石凳。
long );
        set("exits", ([
                "north"    : __DIR__"houting",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
