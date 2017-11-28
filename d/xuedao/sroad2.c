inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
一条山路蜿蜒在山间。向西望去，可以见到大雪山的银色
的雪顶在熠熠生辉。
LONG);
        set("exits", ([
                "east" : __DIR__"sroad1",
                "west" : __DIR__"sroad3",
        ]));
        set("outdoors", "xuedao");
        setup();
        replace_program(ROOM);
}
