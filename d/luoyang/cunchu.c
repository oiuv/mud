inherit ROOM;

void create()
{
	set("short", "存储室");
	set("long", @LONG
这里是当铺的存储室，用于存储一些已被典当，但还可能被物主赎回
的东西，当然这只是暂时的，只要一过了可赎回的期限，当铺老板会毫不
犹豫的将其高价出售，要知道商人除了钱是什么也不会认的。这里阴森黑
暗潮湿，而且空气中还充斥着一股霉味。
LONG);
	set("no_clean_up", 0);
	set("exits", ([
  		"up" : __DIR__"dangpu",
	]));

	setup();
	replace_program(ROOM);
}
