inherit ROOM;

void create()
{
        set("short", "土路");
        set("long", @LONG
这是一条不起眼的土路，却是连接大轮寺与中原的必经之
路。西边点点的炊烟依稀可见。往北可以通往雪山寺。
LONG );
        set("outdoors", "xuedao");
        set("exits", ([
                "east" : __DIR__"tulu1",
                "north" : __DIR__"tulu3",
                "west" : __DIR__"kedian",
        ]));
        setup();
        replace_program(ROOM);
}
