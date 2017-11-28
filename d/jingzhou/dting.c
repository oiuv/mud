inherit ROOM;

void create()
{
	set("short", "东厅");
	set("long", @LONG
这里是万俯内的东厅，房间里摆着一张桌子，以及一个书
架，书架上放着很多书籍，墙上挂着几幅字画，这里好像是万
门弟子练功的地方。
LONG);
	set("exits", ([
		"west" : __DIR__"dayuan",		
	]));

	setup();
	replace_program(ROOM);
}

