inherit ROOM;

void create()
{
        set("short", "青石路");
        set("long", @LONG
一条青石大道，青石铺成，平坦宽阔，远远的可以看见昆
明了。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "west" : __DIR__"qingshilu2", 
                "east"  :__DIR__"qingshilu",
        ]));
        set("objects", ([
                "/d/beijing/npc/tangzi" : 1,
        ]));
        setup();
        replace_program(ROOM);
}