inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
从武功西门出来，路势变急了，这是一条用石块铺成的山
路。路两旁光秃秃的，没有什么树木，全是一块块石头。这条
路好象通往前面的终南山上。北面有一个小村庄，村中正升起
冉冉的炊烟。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "eastup" : __DIR__"shanlu2",
                "northup" : __DIR__"xiaocun",
                "southwest" : __DIR__"ximen",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
