inherit ROOM;

void create()
{
	set("short", "茶馆");
	set("long", @LONG
你刚一走进来，就闻到一股茶香沁入心脾，精神为之一爽。
几张八仙桌一字排开，坐满了客人，或高声谈笑，或交头接耳。
几个店伙计在一旁伺候着客人们，在台后坐着一位老板娘，正
在弹着算盘。
LONG );
	set("resource/water", 1);
	set("exits", ([
		"west" : __DIR__"nandajie3",
	]));
	set("objects", ([
		__DIR__"npc/lady2" : 1,
	]));
	setup();
	replace_program(ROOM);
}

