inherit ROOM;
#include <room.h>

void create()
{
    	set("short", "大殿");
    	set("long", @LONG
你走到殿口，只见大殿中也到处都是骸骨，玉刀玉剑散满
了一地，想来当日必曾有过一场激战。殿中地下到处是大大小
小的玉制武器，刀枪剑戟都有，只是形状奇特，与中土习见的
迥然不同。骸骨前面有一块十分光滑的石板。
LONG);
        set("objects", ([
                __DIR__"obj/yufu" : random(3),
                __DIR__"obj/yudao" : random(3),
                __DIR__"obj/yujian" : random(3),
        	__DIR__"obj/skeleton" : random(5) + 3,
        	__DIR__"obj/skeleton1" : 1,
	]));
    	set("exits", ([ 
        	"west" : __DIR__"yongdao4",
        	"north" : __DIR__"diantang",
	]));
    	setup();
}
