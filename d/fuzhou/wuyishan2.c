// Room: /d/fuzhou/wuyishan2.c
// Date: May 12, 98  Java

inherit ROOM;

void create()
{
	set("short", "九曲溪");
	set("long", @LONG
九曲溪依山而流，九曲九折，穿梭丹岩之中，水色碧透，掬
手可饮，“曲曲山回转，峰峰水抱流”，山光水色，融为一体。
沿岸大王峰巍峨，玉女峰俏立，备极景致。
LONG );
	set("exits", ([
		"east"      : __DIR__"wuyishan1",
		"west"      : __DIR__"wuyishan5",
		"northup"   : __DIR__"wuyishan6",
		"south"     : __DIR__"wuyishan7",
	]));
	set("resource/water", 1);
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

