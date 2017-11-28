inherit ROOM;

void create()
{
	set("short", "水莲洞内");
	set("long", @LONG
这里四周空旷，比起外面来却没有那么潮湿。
LONG);
	set("exits",([
	       "south" : __DIR__"inhole2",
	]));
	
	set("objects",([
	       "/clone/beast/yanjingshe" : 2,
	]));
	
	setup();
	
}

void init()
{
       object me = this_player();

       if (present("fire", me))
              	set("exits/north", __DIR__"zigai3");
	
	return ;
}


