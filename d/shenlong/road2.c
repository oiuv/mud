
inherit ROOM;

void create()
{
	set("short", "山道");
	set("long", @LONG
这是一条狭窄的山道，向着北方一座山峰行去。转过了几个山坡，抬
头遥见峰顶建着几座大竹屋。
LONG );
	set("exits", ([
		"north" : __DIR__"damen",
		"south" : __DIR__"road",
	]));
	set("objects", ([
		__DIR__"npc/dizi": random(4),
		__DIR__"npc/old": random(3),
	]) );
	setup();
	replace_program(ROOM);
}


