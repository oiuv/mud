inherit ROOM;

void create()
{
  	set("short", "花园");
  	set("long", @LONG
你的眼前出现了一个美丽的花园，花园里种着一些花，花
从中隐约可见飘渺的倩影，那是宫中的姐妹们在玩耍。花园中
央有一座假山。花园的东西两头是长廊，北边有一条小道通向
天山童姥修练之处。
LONG);
  	set("exits",([
      		"west" : __DIR__"changl1",
      		"north" : __DIR__"xiaodao1",
      		"east" : __DIR__"changl2",
      		"south" : __DIR__"changl15",
  	]));
  	set("outdoors", "lingjiu");
  	set("objects", ([
      		"/clone/quarry/lu" : 1,
  	]));
  	setup();
        replace_program(ROOM);
}
