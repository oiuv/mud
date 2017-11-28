inherit ROOM;

void create()
{
        set("short", "丝绸之路");
          set("long", @LONG
这是一条中原和西域之间的商道。西面是一望无际的大沙
漠，传说那里常有盗匪出没。西北则通向一片连绵的山脉东面
就是通向中原的路。路边有一块石碑。
LONG);
        set("outdoors", "xiyu");
        set("exits", ([
                "east" : __DIR__"silk3",
		"west" : __DIR__"shamo1",
                "northwest" : __DIR__"shanjiao",
		"southwest" : "/d/xueshan/caoyuan" ,
        ]));
        setup();
        replace_program(ROOM);
}
