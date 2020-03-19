inherit ROOM;

void create()
{
        set("short", "冰道");
        set("long", @LONG
这里是一片冰雕玉砌的世界。走在路上，低头一看，路面是
用万载不化的寒冰所制，晶莹剔透，足可映物，照理说走在这样
的冰上，应该滑溜不堪，但仔细一看，每处冰道上，都雕有细细
的花纹，而且做工精细，显然耗费了大量人力。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"south" : __DIR__"gate",
            	"north" : __DIR__"iceroad2",
            	"west"  : __DIR__"hotel",
            	"east"  : __DIR__"sell",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

