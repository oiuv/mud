inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这里是白驼山庄广场西边的一条小路，寻常百姓平时都是
经过这条小路上山。
LONG);
        set("exits", ([
                "north" : __DIR__"shanlu1",
                "east"  : __DIR__"guangchang",
        ]));
        set("outdoors", "baituo");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
