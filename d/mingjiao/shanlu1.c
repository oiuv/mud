// Room: /d/mingjiao/shanlu1.c
// Date: Java 97/04/9

inherit ROOM;

void create()
{
	set("short", "青石阶");
	set("long", @LONG
这里已是半山腰了。不远的前面有一座竹亭，几位剑客在
这里歇息。山路到这里更加陡峭，四下望去，层峦迭嶂，满目
滴翠远山披银装，云海现奇观。
LONG );
	set("exits", ([
		"eastdown" : __DIR__"shanmen",
		"westup" : __DIR__"shanlu2",
	]));
        set("objects",([
             "/d/taishan/npc/jian-ke": 3,
             "/d/taishan/npc/dao-ke" : 2,
        ]));
	set("no_clean_up", 0);
	set("outdoors", "mingjiao");
	setup();
	replace_program(ROOM);
}

