// Room: /d/suzhou/hehuating.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "荷花厅");
	set("long", @LONG
荷花厅的主建筑面阔三间，宽敝高爽，厅名取朱熹：“一
水方涵碧，千林以变红”之诗意。厅前宽广的平台依临荷池，
为夏日赏荷纳凉胜处，故称“荷花厅”。厅后有花台庭院，
叠石种树，自成一景。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"east"  : __DIR__"liuyuan",
		"west"  : __DIR__"gumujiaohe",
	]));
	setup();
	replace_program(ROOM);
}

