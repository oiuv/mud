inherit ROOM;

void create()
{
	set("short", "新罗坊");
	set("long", @LONG
新罗坊，顾名思义是给新罗人住的地方，不过其实现在新罗已经被高
丽所灭掉，这里应该叫做高丽坊的。可是大家已经习惯了，于是便还这么
叫。这里住着许多高丽商人，也有些高丽的使臣进东京城路过襄阳，便也
住在这里。这里的高丽商人总有很多很好的货物，大家都喜欢来买，于是
这里就非常的热闹了。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"south" : __DIR__"wroad1",
	]));
        set("objects", ([
                "/d/xiangyang/npc/gaoli" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
