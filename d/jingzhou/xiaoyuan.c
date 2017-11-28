inherit ROOM;

void create()
{
	set("short", "卉园");
	set("long", @LONG
这里是一处幽静的环境所在，偶尔听到外面竹林中传来几
声清脆的鸟叫，园子里种着各式各样的珍奇花草。有绿菊，兰
花，杜鹃、牡丹……
LONG );
        set("outdoors", "jingzhou");
	set("exits", ([
		"out" : "/d/jingzhou/zizhulin1"
	]));
	set("objects",([
		"/d/jingzhou/obj/lvju" : 3,
		"/d/jingzhou/npc/obj/juhua" : 1,
	]));

	setup();
        replace_program(ROOM);
}

