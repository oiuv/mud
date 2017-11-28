inherit ROOM;

void create()
{
        set("short", "广场");
        set("long", @LONG
这里便是红花会总舵内正厅前的一个广场，广场不大，前
方是一条红木制走廊，通往大厅所在。左右两边分别通往兵器
房和厨房，几个红花会的会众穿梭其中。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"hh_zoulang1",
  		"south" : __DIR__"hh_lianwu1",
  		"west" : __DIR__"hh_bingqi",
  		"east" : __DIR__"hh_chufang",
	]));
        set("objects", ([
                __DIR__"npc/honghua1" : 2,
        ]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
