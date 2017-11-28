inherit ROOM;
void create()
{
        set("short", "菜市场");
        set("long", @LONG
这里是兰州城内最大的蔬菜批发市场，方圆百里的农民都
将自己种植的蔬菜送到这儿来出售。这里的蔬菜量多，价格又
便宜，很多做蔬菜生意的贩子都到这儿来采购。
LONG);
        set("outdoors", "lanzhou");
        set("exits", ([
                "west" : __DIR__"beidajie1",
                "south" : __DIR__"dongdajie1",
                ]));
        set("objects", ([
        	__DIR__"npc/liumang" : 2,
        	__DIR__"npc/cainong" : 1,
        	__DIR__"npc/boy" : 1,
        	__DIR__"npc/girl" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
