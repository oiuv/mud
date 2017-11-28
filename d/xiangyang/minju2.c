// Room: /d/xiangyang/minju2.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "民居");
	set("long", @LONG
这是一家比较有钱人的住房，房子主人正在家里忙这忙那，
看见你进来，急忙站起身向你打招呼。
LONG );
	set("no_clean_up", 0);

	set("exits", ([
		"east" : __DIR__"jiedao",
	]));
	setup();
	replace_program(ROOM);
}

