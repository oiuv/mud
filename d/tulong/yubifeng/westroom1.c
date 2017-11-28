inherit ROOM;

void create()
{
        set("short", "书房");
        set("long", @long
这里是庄主的书房推开房门，见里面四壁图书，陈设得甚是精雅。
long );
        set("exits", ([
                "east"    : __DIR__"zoulang3",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
