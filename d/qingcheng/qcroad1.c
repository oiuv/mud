// Room: /qingcheng/qcroad1.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "青石大道");
	set("long", @LONG
你走在青石大道上。两边是稀硫的树林和连片的田野。一条条
小溪和路平行，溪流清澈见底，水流甚急。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"south" : "/d/city3/fuheqiaon",
		"west"  : __DIR__"qcroad2",
	]));
	setup();
	replace_program(ROOM);
}

