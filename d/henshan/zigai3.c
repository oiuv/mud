inherit ROOM;

void create()
{
	set("short", "水莲洞内");
	set("long", @LONG
这里四周空旷，比起外面来却没有那么潮湿，路到这里却
没有了。
LONG);

	set("exits", ([
	       "south" : __DIR__"zigai2",
	]));
	
	set("objects", ([
	       "/clone/beast/yanjingshe" : 2,
	]));
	
	setup();
	replace_program(ROOM);
}


