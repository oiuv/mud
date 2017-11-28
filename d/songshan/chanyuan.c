inherit ROOM;

void create()
{
	set("short", "峻极禅院");
	set("long", @LONG
峻极禅院处嵩山绝顶，院中古柏森森，殿上并无佛像。院
宇辽阔，可容千人。
LONG );
	set("exits", ([
		"southdown" : __DIR__"junjigate",
                "east"      : __DIR__"changlang",
	]));
	set("objects", ([
		__DIR__"npc/shi" :1,
	]));
	setup();
	replace_program(ROOM);
	"/clone/board/songshan_b"->foo();
}

