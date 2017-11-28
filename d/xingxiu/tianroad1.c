inherit ROOM;

void create()
{
        set("short", "天山山路");
        set("long", @LONG
这里是天山东麓，山风从山上吹来，你冷得瑟瑟发抖。路
边是一片草原。草原上一位牧羊人赶着一群羊。这里向东可以
下山。北边传来阵阵猛兽的啸声。
LONG);
        set("exits", ([
            	"eastdown" : __DIR__"shanjiao",
            	"north" : __DIR__"tianroad2",
        ]));
        set("objects", ([
                __DIR__"npc/herdsman" : 1,
        ]));
        setup();
        replace_program(ROOM);
}

