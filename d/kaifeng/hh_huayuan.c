inherit ROOM;

void create()
{
        set("short", "后花园");
        set("long", @LONG
这里是总舵内的后花园，一年四季都生长着各种奇异的花
草，在阳光下发出七彩妖艳的光辉。花园里一片沉寂，竟看不
到一只蜜蜂或蝴蝶飞舞。有一条石子小路通向前面一座花厅。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"hh_penquan",
  		"west" : __DIR__"hh_jiashan",
  		"north" : __DIR__"hh_road",
  		"south" : __DIR__"hh_hguangchang",
	]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
