// Room: /qingcheng/qcroad2.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "青石大道");
	set("long", @LONG
你走在青石大道上。远远传来细细的水声，掩盖在路边密密树
林的风声中。望北可以看到一座大山了，苍苍翠翠，象一块清清纯
纯的碧玉。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"south"  : __DIR__"qcroad2",
		"north"  : __DIR__"xiaoqiao",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

