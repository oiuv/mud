inherit ROOM;

void create()
{
	set("short", "南门");
	set("long", @LONG
这里是佛山镇的南门。从出南门再向南行进，就到达南海
之滨了。北面一条东西向的大街是佛山镇的主要街道。
LONG);
	set("outdoors", "foshan");
	set("exits", ([
                "north" : __DIR__"street3",
                "south" : "/d/xiakedao/xkroad3",
	]));
        set("objects", ([
                "/clone/npc/walker" : 1,
        ]));
	setup();
	replace_program(ROOM);
}

