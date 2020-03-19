inherit ROOM;  
#include <ansi.h> 

void create()
{
        set("short", "山路");
        set("long", @LONG
越往上走，寒气愈甚，霜雪漫天纷纷而下。极目远望，只见
满天雪白，万物晶莹。不远处似乎有个湖泊，山泉瀑布奔腾入湖，
绿树丛中馥郁的鲜花争妍斗艳，让你不由得加快脚步。路旁结满
了一条条冰柱，倒垂而下，锋利尖锐，有时凌霄弟子练剑之时也
将其作为兵器使用。
LONG);
        set("outdoors", "lingxiao");
        set("exits", ([
            	"southdown"  : __DIR__"sroad4",
            	"north"  : __DIR__"sroad6",
        ]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
        set("no_clean_up", 0);
	set("ice_count", 5);
        setup();
        replace_program(ROOM);
} 
