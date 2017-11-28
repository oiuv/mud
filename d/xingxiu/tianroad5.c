inherit ROOM;

void create()
{
        set("short", "天山山路");
        set("long", @LONG
这里是天山东麓，山风从山上吹来，你冷得瑟瑟发抖。路
边是一片针叶林。西边望去，顶峰遥遥可见。
LONG );
        set("exits", ([
            	"westup" : __DIR__"tianroad6",
            	"eastdown" : __DIR__"tianroad4",
        ]));

        if (random(10) > 8)
        	set("objects", ([
                	__DIR__"npc/caiyaoren" : 1, 
        	]));

        set("outdoors", "xingxiu");
        setup();
        replace_program(ROOM);
}

