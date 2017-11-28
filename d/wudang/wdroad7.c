inherit ROOM;

void create()
{
        set("short", "小路");
        set("long", @LONG
这里一条静悄悄的黄土路，两旁有些小土屋，疏疏落落的。
路上行人很少，都行色匆匆向前赶路。
LONG);
        set("outdoors", "wudang");
        set("exits", ([
            "east"      : __DIR__"wdroad6",
            "southwest" : __DIR__"wdroad8",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}


