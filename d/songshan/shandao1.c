inherit ROOM;

void create()
{
	set("short", "山道");
	set("long", @LONG
你走在嵩山山道，青松翠柏，山风岚雾，时来飘荡。左边
通往启母石，右手是芦岩瀑布。
LONG );
	set("exits", ([
		"southdown" : __DIR__"dadian",
		"northwest" : __DIR__"qimushi",
		"northeast" : __DIR__"luyanpubu",
	]));
	set("no_clean_up", 0);
	set("outdoors", "songshan");
	setup();
	replace_program(ROOM);
}

