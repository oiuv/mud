inherit ROOM;

void create()
{
        set("short",  "青石路" );
        set("long", @LONG
一条青石大道，青石铺成，平坦宽阔，抬头一看，前面的
城门清晰可见。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "west" : __DIR__"dongmen", 
                "east"  :__DIR__"qingshilu1",
        ]));
        setup();
        replace_program(ROOM);
}
