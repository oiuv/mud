inherit ROOM;

void create()
{
        set("short", "土路");
        set("long", @LONG
这是一条不起眼的土路，不宽却也不窄，松散的浮尘显露
出来往行商的频繁。它是连接大轮寺与中原的必经之路。
LONG);
        set("outdoors", "xuedao");
        set("exits", ([
                "east" : __DIR__"caoyuan",
                "west" : __DIR__"tulu2",
        ]));
        setup();
        replace_program(ROOM);
}
