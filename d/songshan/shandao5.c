inherit ROOM;

void create()
{
	set("short", "山道");
	set("long", @LONG
你走在嵩山山道，青松翠柏，山风岚雾，时来飘荡。远望
山下犬吠鸡啼，顿起仙凡之感。
LONG );
	set("exits", ([
		"northup"   : __DIR__"chaotian",
		"southwest" : __DIR__"fawangsi",
		"east"      : __DIR__"shandao7",
	]));
	set("outdoors", "songshan");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

