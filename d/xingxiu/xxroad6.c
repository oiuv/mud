inherit ROOM;

void create()
{
        set("short", "山间平地");
        set("long", @LONG
山间平地，地上是嫩绿的小草，周围布了几棵桦树，山边
有一眼清泉。草地上树着几个星宿老怪当年从少林寺偷来的木
人，显是星宿弟子练功所用。西边过去还有一块平地，也是练
功的去处。
LONG );

        set("resource/water", 1);
        set("objects", ([
                __DIR__"obj/yangrou" : 3,
        ]));
        set("exits", ([
                "south" : __DIR__"xxroad5",
                "west" : __DIR__"wuchang2",
        ]));
        set("outdoors", "xingxiu");
        set("for_family", "星宿派");
        setup();
        replace_program(ROOM);
}
