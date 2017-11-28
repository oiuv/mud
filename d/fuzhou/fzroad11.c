// Room: /d/fuzhou/fzroad11.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "闽中大道");
	set("long", @LONG
这里密迩城郊，来往行人也渐渐都了起来。福州的官话听起
来刺耳难懂，可是抑扬顿挫，别有一番风味。
LONG );
	set("exits", ([
		"east"   : __DIR__"ximen",
		"west"   : __DIR__"fzroad9",
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

