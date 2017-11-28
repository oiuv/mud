
inherit ROOM;

void create()
{
	set("short", "山道");
	set("long", @LONG
你走在嵩山山道，青松翠柏，山风岚雾，时来飘荡。远望
山下犬吠鸡啼，顿起仙凡之感。
LONG );
	set("exits", ([
		"northup"   : __DIR__"fawangsi",
		"southeast" : __DIR__"songyuesi",
	]));
	set("no_clean_up", 0);
	set("outdoors", "songshan");
	setup();
	replace_program(ROOM);
}

