inherit ROOM;

void create()
{
        set("short", "喷泉");
        set("long", @LONG
这里是总舵内的后花园，一年四季都生长着各种奇异的花
草，在阳光下发出七彩妖艳的光辉。花园正中是一潭清波，潭
中不停的冒着清泉，鱼儿在潭中游来游去。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
  		"west" : __DIR__"hh_huayuan",
  		"east" : __DIR__"hh_xiaojing2",
	]));
        set("outdoors", "honghua");
        setup();
        replace_program(ROOM);
}
