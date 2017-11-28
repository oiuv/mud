inherit ROOM;

void create()
{
	set("short", "春来茶馆");
	set("long", @LONG
你走进来就闻到一股茶香沁入心脾，精神为之一爽。几张
八仙桌一字排开，坐满了客人，或高声谈笑，或交头接耳。你
要想打听江湖掌故和谣言，这里是个好所在。
LONG );
	set("resource/water", 1);
	set("exits", ([
		"east" : __DIR__"nandajie2",
	]));
	set("objects", ([
		__DIR__"npc/aqingsao" : 1,
	]));
	setup();
	replace_program(ROOM);
	"/clone/board/player_b"->foo();
}
