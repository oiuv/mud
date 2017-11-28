// Room: /qingcheng/qcroad2.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "青泥小道");
	set("long", @LONG
你走在青泥小道上。左边不远传来阵阵水响，原来那里就是天
下知名都江堰。拦河分流，使岷江之水分注到无数小小溪流中，才
免了连年的水祸，灌溉出了这富饶的成都平原。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"north" : __DIR__"qcroad3",
		"east"  : __DIR__"qcroad1",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

