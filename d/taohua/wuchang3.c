inherit ROOM;

void create()
{
        set("short", "修行场");
        set("long", @LONG
这里是桃花岛弹指山庄修行的场所，大部分的桃花岛弟子
武功有了一定的根基以后就在这里苦修，领悟上乘武学。
LONG);
        set("exits", ([
                "north" : __DIR__"houyuan",
        ]));
        set("outdoors", "taohua");
        set("for_family", "桃花岛");
        setup();
        replace_program(ROOM);
}
