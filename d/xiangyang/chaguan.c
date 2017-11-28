// Room: /d/xiangyang/chaguan.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "茶馆");
	set("long", @LONG
你一走进来，就闻到一股茶香沁入心脾，精神为之一爽。
几张八仙桌一字排开，坐满了客人，或高声谈论战局，或交头
接耳元兵势大。你要想打听什么，恐怕不是时候。
LONG );
	set("resource/water", 1);
	set("no_clean_up", 0);
	set("exits", ([
		"west" : __DIR__"northjie",
	]));
	setup();
	replace_program(ROOM);
}

