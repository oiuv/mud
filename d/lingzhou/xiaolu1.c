inherit ROOM;

void create()
{
	set("short", "林中小路");
	set("long", @LONG
这是陡坡上的一条杂草丛生的羊肠小路，看起来平时没什
么人迹，路边开着不知名野花，两边松树依然高大挺拔。阳光
透下来照的你身上是斑斑驳驳的影子。
LONG );
	set("exits", ([
		"south"     : __DIR__"dalu",
		"north"     : __DIR__"xiaolu2",
	]));
	set("objects", ([
		"/clone/quarry/tu" : 1,
	]));
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

