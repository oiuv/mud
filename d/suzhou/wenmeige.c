// Room: /d/suzhou/wenmeige.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "问梅阁");
	set("long", @LONG
阁内的桌凳、花窗、地坪、书画皆取材于梅花，并悬匾额
“绮窗春讯”。阁前种植了许多枝梅，以符阁名。曾为旧时文
人著书、绘画之处。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"west"  : __DIR__"zhenquting",
		"south" : __DIR__"lixuetang",
	]));
	set("objects", ([
		__DIR__"npc/lady4" : 1,
	]));
	setup();
	replace_program(ROOM);
}

