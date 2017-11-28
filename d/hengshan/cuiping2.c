// Room: /d/hengshan/cuiping2.c
// Date: CSWORD 96/03/25

inherit ROOM;

void create()
{
	set("short", "翠屏山道");
	set("long", @LONG
你爬在翠屏山道上，树木遮天，难见天日。山林静谧，隐隐晨
钟轻敲，一切尘俗尽皆洗尽，山深有静气，恒山本色。
LONG
	);
	set("exits", ([
		"eastup"   : __DIR__"xuankong1",
		"eastdown" : __DIR__"cuiping1",
	]));

	set("outdoors", "hengshan");
        set("no_clean_up", 0);
	setup();
        replace_program(ROOM);
}

