inherit ROOM;

void create()
{
        set("short", "土路");
        set("long", @LONG
这是一条不起眼的土路。尘埃泛起的远方，北边波光潋滟
的一大片幽蓝水光处，就是著名的圣湖。
LONG);
        set("outdoors", "xuedao");
        set("exits", ([
                "south" : __DIR__"tulu2",
                "north" : __DIR__"shenghu",
        ]));
        setup();
}
