// Room: /d/hengshan/cuiping1.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "翠屏山道");
	set("long", @LONG
你爬在翠屏山道上，石阶陡峭，近在目前。回头外望，恒山重
峦叠嶂，林木幽深，倍感静谧。
LONG
	);
	set("exits", ([
		"westup"  : __DIR__"cuiping2",
		"down"    : __DIR__"cuipinggu2",
	]));

	set("outdoors", "hengshan");
        set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}

