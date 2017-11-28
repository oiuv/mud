#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
    	set("short", "殿堂");
    	set("long", @LONG
走到大殿之后，见是一座较小的殿堂，殿中情景却尤为可
怖，数十具骸骨一堆堆相互纠结，骸骨大都直立如生时，有的
手中握有兵刃，有的却是空手。西侧有一扇小石门。
LONG);
        set("objects", ([
                __DIR__"obj/yudao" : random(2),
                __DIR__"obj/yujian" : random(2),
                __DIR__"obj/skeleton" : random(3) + 1,
	]));

        set("exits", ([ 
        	"south" : __DIR__"dadian",
        	"west" : __DIR__"yushi",
    	]));
    	create_door("west", WHT "小石门" NOR, "east", DOOR_CLOSED);
    	setup();
    	replace_program(ROOM);
}
