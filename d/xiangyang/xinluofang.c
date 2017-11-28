// Room: /d/xiangyang/xinluofang.c
// Date: Jan. 8 1999 by Winder

inherit ROOM;

void create()
{
	set("short", "新罗坊");
	set("long", @LONG
新罗坊，顾名思义是给新罗人住的地方，不过其实现在新
罗已经被高丽所灭掉，这里应该叫做高丽坊的。可是大家已经
习惯了，于是便还这么叫。这里住着许多高丽商人，也有些高
丽的使臣进东京城路过襄阳，便也住在这里。这里的高丽商人
总有很多很好的货物，大家都喜欢来买，于是这里就非常的热
闹了。
LONG );
	set("exits", ([
		"south" : __DIR__"northroad1",
	]));
	set("objects", ([
		__DIR__"npc/gaoli" : 1,
	]));
	setup();
	replace_program(ROOM);
}

