inherit ROOM;

void create()
{
        set("short", "后广场");
        set("long", @LONG
这里便是红花会总舵内厅后的一个广场，广场不大，南边
是一条红木制走廊，通往大厅所在。左右两边分别通往账房和
刑堂，几个红花会的会众穿梭其中。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"north" : __DIR__"hh_huayuan",
  		"south" : __DIR__"hh_zoulang8",
  		"east" : __DIR__"hh_xingtang",
  		"west" : __DIR__"hh_zhangfang",
	]));
        set("objects", ([
                __DIR__"npc/honghua1" : 2,
        ]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
