//RJQMENLOU1.C

inherit ROOM;

void create()
{
	set("short", "门楼一层");
	set("long", @LONG
这里是一间大石室，石室四周整齐的码置着兵器架，十八
般兵器样样俱全。几个教众在室中巡逻，好象是守护兵器的。
右面有一条石梯直通楼上。
LONG );
	set("exits", ([
		"up" : __DIR__"rjqmenlou2",
		"east" : __DIR__"rjqyuan",
	]));
	set("no_clean_up", 0);
//	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}
