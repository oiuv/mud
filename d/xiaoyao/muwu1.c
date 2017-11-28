inherit ROOM;

void create()
{
        set("short", "木屋");
        set("long", @LONG
这里是一间不大的木头屋子，但是麻雀虽小五藏俱全，屋
子中只是疏疏落落地摆着几件家具，所以也不显得怎么小。
LONG );
        set("exits", ([
                "north" : __DIR__"xiaodao5",
        ]));
        set("objects", ([
                CLASS_D("xiaoyao") + "/kanggl" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
