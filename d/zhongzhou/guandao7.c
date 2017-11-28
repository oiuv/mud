inherit ROOM;

void create()
{
  	set ("short", "官道");
  	set ("long", @LONG
这是一条由官府铺设的道路，可容八马并驱。是南北交通
要道。行人明显多了，不时还有骑马的和赶车的经过。
LONG);

  	set("outdoors", "zhongzhou");
  	set("exits", ([
  		"south" : __DIR__"beimen",
  		"north" : __DIR__"guandao6",
	]));
  	setup();
}
