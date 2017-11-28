inherit ROOM;

void create()
{
	set("short","碧鸡山顶");
	set("long",@LONG
碧鸡山坐在滇池的西岸上，与拓东城隔水相望。山势高
耸入云，山形如公鸡，漫山树木苍翠欲滴。此处乃极顶，已
达云端，东眺滇池一片汪洋，美不胜收。山下属大理国的昆
州。东西皆有下山之路。
LONG);
	set("objects", ([
	   	__DIR__"npc/youke" : 1,
	]));
	set("outdoors", "dali");
	set("exits", ([
	    	"westdown" : __DIR__"qingxi",
	    	"eastdown" : __DIR__"yanan2",
	]));
	setup();
	replace_program(ROOM);
}

