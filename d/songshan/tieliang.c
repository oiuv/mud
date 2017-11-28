
inherit ROOM;

void create()
{
	set("short", "铁梁峡");
	set("long", @LONG
由此上山，山路越发险竣。铁梁峡右侧尽是怪石，而左边
则为万仞深谷，渺不见底。隔着峡谷，青冈峰环抱青冈坪，向
上是主峰的山路。
LONG );
	set("exits", ([
		"down"    : __DIR__"luyanpubu",
		"northup" : __DIR__"shandao7",
	]));
	set("objects", ([
		__DIR__"npc/lu" : 1,
	]));
	set("no_clean_up", 0);
	set("outdoors", "songshan");
	setup();
	replace_program(ROOM);
}

