inherit ROOM;

void create()
{
	set("short", "青石大道");
	set("long", @LONG
这是一条通往成都的大青石道，两旁绿树荫蔽，空气十分
清新。成都平原向称天府之国，四野鸡鸣犬吠，交替起落一派
安乐气息。西面隐隐可以看到成都城门了。
LONG);
	set("outdoors", "chengdu");
	set("exits", ([
	    "southeast" : __DIR__"road1",
	    "west"      : __DIR__"fuheqiaoe",
	    "east"      : __DIR__"shudao19",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

