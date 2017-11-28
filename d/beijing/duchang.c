#include <room.h>
inherit ROOM;

void create()
{
	set("short", "宏升赌场");
	set("long", @LONG
这里就是北京城中最大的宏升赌场，四周的赌房里传出来吆五喝六的赌博
声。这个赌场规模虽算不上很大, 但赌的种类却很齐全, 服务也非常周到。在
这儿, 世上的各行各色的人夹杂在一起, 有腰盘万贯的富家子弟, 也有穷得叮
当响的穷汉。有拿刀配剑的的江湖侠客, 也有掉儿啷当的流氓地坯。有官府的
侍卫, 也有在逃的犯人。
LONG );
       set("exits", ([
		"south" : __DIR__"yong_1",
	]));
	set("objects", ([
		__DIR__"npc/duke" : 2,
		__DIR__"npc/liumang" : 1,
		__DIR__"npc/haoke1" : 1,
		__DIR__"npc/dipi" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

