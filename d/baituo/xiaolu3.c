inherit ROOM;

void create()
{
	set("short", "小路");
        set("long", @LONG
这里是一条上山的小路。东北方有山贼出没，要格外小心。
LONG);
	set("outdoors", "baituo");
	set("exits", ([
		"northeast" : __DIR__"xiaolu4",
		"southdown" : __DIR__"xiaolu2",
	]));
	set("objects",([
		__DIR__"npc/shanzei1" : 1,
	]));

	setup();
	replace_program(ROOM);
}
