inherit ROOM;

void create()
{
        set("short", "打谷场");
        set("long", @LONG
这里是村子的中心，一个平坦的广场，每年秋收打谷就在
这。广场东角有棵大槐树，平日茶余饭後，村里的男女老少都
爱聚在这里谈天说地。角上有几个大谷堆。
LONG );
        set("exits", ([
                "northwest" : __DIR__"nwroad2",
                "south" : __DIR__"sroad4",
                "east"  : __DIR__"eroad3",
        ]));
        set("objects", ([
                __DIR__"npc/kid": 2,
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
