// Room: /d/fuzhou/wuyishan5.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "九曲溪");
	set("long", @LONG
盈盈一水，折为九曲。两岸树绿竹翠，奇峰突兀，真是“溪
流九曲泻云液，山光倒浸清涟漪”。
LONG );
	set("exits", ([
		"east"      : __DIR__"wuyishan2",
		"northup"   : __DIR__"wuyishan3",
		"northwest" : __DIR__"wuyishan4",
	]));
	set("resource/water", 1);
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

