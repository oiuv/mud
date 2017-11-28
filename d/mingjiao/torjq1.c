//TORJQ1.C

inherit ROOM;

void create()
{
	set("short", "青石大道");
	set("long", @LONG
这里是通往锐金旗的大道。道路开阔，大概可容十人并肩而行。
相传锐金旗是明教五旗中成立最早，规模最为宏伟的。百年来人才
辈出，除了守护明教外围，还负责明教中所有兵器和护具的打造。
LONG );
	set("exits", ([
		"northeast" : __DIR__"torjq2",
		"southwest" : __DIR__"lhqpaifang",
	]));
	set("no_clean_up", 0);
	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}
