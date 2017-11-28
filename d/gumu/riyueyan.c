
inherit ROOM;

void create()
{
        set("short", "日月岩");
        set("long", @LONG
一路过来，只见光秃秃的山路两旁，怪石林立，颇为吓人。
尤其是前方不远处的两块巨石，左边的一块像月亮，右边的那
块像太阳，夹道而立，便如一对门神，只留当中一条宽约一人
多的小道，让人通过。往东下和北上走都是一条蜿蜒的山路。
LONG
        );
        set("outdoors", "quanzhen");
        set("exits", ([
                "eastdown"  : __DIR__"shanlu10",
                "northup"   : __DIR__"shanlu9",
        ]));

        setup();
        replace_program(ROOM);
}
