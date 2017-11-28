//Room: biaoju-dayuan.c

inherit ROOM;

void create()
{
        set("short", "河洛镖局大院");
        set("long", @LONG
院子里面堆放着十几辆用草席盖着的空镖车，草席上积满了雪，东
面的屋檐下，斜插着一面酱色镶金边的镖旗，被风吹得蜡蜡作响，使人
几乎分辨不出用金线绣在那上面的是老虎，还是狮子。大院里不时镖师
进出。
LONG);
        set("exits", ([
        	"north" : __DIR__"biaoju-damen",
        	"south" : __DIR__"biaoju-dating",
        ]));
        set("objects", ([
        	__DIR__"npc/biaotou" : 1,
        	__DIR__"npc/tang" : 2,
        ]) );
    
        set("outdoors", "changan");
        setup();
        replace_program(ROOM);
}
