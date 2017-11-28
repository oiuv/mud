inherit ROOM;

void create()
{
	set("short", "前广场");
	set("long", @LONG
这里是商家堡内的一个广场，整个广场用沙石铺砌而成，非
常的干净。广场的北边有一条青石小径，可以通过它到达商家堡
的厅内。
LONG);
	set("exits", ([
		"north"  : __DIR__"shang_xiaojin1",
		"south"  : __DIR__"shang_men",
		"west"  : __DIR__"shang_lianwuw",
		"east"  : __DIR__"shang_lianwue",
	]));
        set("objects", ([
                __DIR__"npc/shang2" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
