inherit ROOM;

void create()
{
        set("short", "假山");
        set("long", @LONG
这里是总舵内的后花园，一年四季都生长着各种奇异的花
草，在阳光下发出七彩妖艳的光辉。花园正中耸立着一座假山
被青苔所覆盖，霎是清秀。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"hh_huayuan",
  		"west" : __DIR__"hh_xiaojing1",
	]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
