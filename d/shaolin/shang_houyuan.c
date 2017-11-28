inherit ROOM;

void create()
{
	set("short", "后院");
	set("long", @LONG
这里是商家堡的后院，后院并不大，整个地面全部是用沙石
铺砌。南边是一条红木制走廊，通往大厅所在。左边不时传来阵
阵扑鼻的饭菜香，原来那里是厨房所在。
LONG);
	set("exits", ([
		"north"  : __DIR__"shang_lianwun",
		"south"  : __DIR__"shang_zoulang2",
		"east"  : __DIR__"shang_huating",
		"west"  : __DIR__"shang_chufang",
	]));
        set("objects", ([
                CLASS_D("shang") + "/tai" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
