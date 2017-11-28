inherit ROOM;

void create()
{
	set("short", "打铁铺");
	set("long", @LONG
这是一家简陋的打铁铺，中心摆着一个火炉，炉火把四周
照得一片通红，你一走进去就感到浑身火热。墙角堆满了已完
工和未完工的菜刀、铁锤、铁棍、匕首、盔甲等物。一位铁匠
满头大汗挥舞着铁锤，专心致志地在打铁。
LONG);
	set("exits", ([
		"west" : __DIR__"nandajie1",
	]));
        set("objects", ([
                 __DIR__"npc/smith": 1,
	]));
	setup();
	replace_program(ROOM);
}

