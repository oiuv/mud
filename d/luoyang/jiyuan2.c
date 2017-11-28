inherit ROOM;

void create()
{
	set("short", "迎客大厅");
	set("long", @LONG
你站在春月楼二楼的迎客大厅里。满耳的淫声秽响不绝如缕。布置的
绝对精致的床上地下，突然对你产生莫名的诱惑和冲动。几个可怜兮兮的
千娇百媚在点手招你，更有几个骚媚十足的已经坐到了你的身旁，伸手勾
你了。四周有四个小厅，专供有钱客人和姑娘单处。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"east" : __DIR__"chenyu",
  		"down" : __DIR__"jiyuan",
  		"south" : __DIR__"xiuhua",
  		"west" : __DIR__"luoyan",
  		"north" : __DIR__"biyue",
	]));
        set("objects", ([
                "/d/beijing/npc/piaoke" : 1,
                "/d/beijing/npc/jinv" : 1,
        ]));
	setup();
	replace_program(ROOM);
}
