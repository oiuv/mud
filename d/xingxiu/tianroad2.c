inherit ROOM;

void create()
{
        set("short", "天山山路");
        set("long", @LONG
这里是天山东麓，山风从山上吹来，你冷得瑟瑟发抖。路
边是一片草原。路尽头松林下一位壮汉正在长啸练功。北上就
是人人害怕的灵鹫宫了.
LONG);
        set("exits", ([
            	"northup" : "/d/lingjiu/shanjiao",
            	"northdown" : __DIR__"xxh1",
            	"south" : __DIR__"tianroad1",
        ]));
        set("objects", ([
                CLASS_D("xingxiu") + "/shihou" : 1,
                __DIR__"npc/gushou"  : 1,
                __DIR__"npc/haoshou" : 1,
                __DIR__"npc/boshou" : 1,
                "/clone/npc/walker" : 1,
        ]));
        set("outdoors", "xingxiu");
        setup();
        replace_program(ROOM);
}

