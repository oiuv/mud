inherit ROOM;

void create()
{
        set("short", "松树林");
        set("long", @LONG
这里是一片浓密的松树林，前面已经没有了道路，你必须不时砍
断横在你面前的枝桠。林内光线黑暗，静的能让你听到自己的心跳声，
只有你踩在地上厚厚的松针和枯枝上发出的沙沙声。
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "north" : __DIR__"sl3",
                "northwest" : __DIR__"sl2",
                "south" : __DIR__"sl8",
                "southwest" : __DIR__"sl7",
        ]));

        setup();
        replace_program(ROOM);
}
