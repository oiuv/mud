inherit ROOM;

void create()
{
	set("short", "玉虚观前");
	set("long", @LONG
东面一座庙观，门前匾上写着玉虚观三个大字，西边一个
碧水荡漾的小湖，四周绿柳成荫，实乃修心养性的好地方。
LONG);
	set("objects", ([
	        __DIR__"npc/xiaodaogu" : 2,
	]));
	set("outdoors", "dali");
	set("exits", ([
	        "north" : __DIR__"yuxuguan",
	        "south" : __DIR__"hudiequan",
	]));
	setup();
	replace_program(ROOM);
}

