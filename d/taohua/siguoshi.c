inherit ROOM;

void create()
{
    set("short", "思过室");
    set("long", @LONG
这是桃花岛上供本门弟子闭门思过的地方。屋里仅仅放着
张床，显得空荡荡的。四面则是光秃秃的墙壁，看上去黑黝黝
的，原来却是铁筑的。靠门的地方有一小洞，洞边放着一只碗。
往东是一间不起眼的小屋。
LONG);
        set("exits", ([
                "west" : __DIR__"houyuan",
                "east" : __DIR__"xiuxishi",
        ]));
        setup();
}
