inherit ROOM;

void create()
{
	set("short", "古道");
	set("long", @LONG
一条石板古道，两边树木苍翠，山势平缓，南面是一望
无际的西双版纳大森林。大道北面有一片宏伟建筑，一堵里
许长的红墙隔开，越过墙头可见一座高楼耸立，正是大理名
胜五华楼。
LONG);
	set("outdoors", "dali");
	set("exits", ([
                "enter" : __DIR__"dating",
                "west"  : __DIR__"shanlu6",
                "east"  : __DIR__"luyuxi",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

