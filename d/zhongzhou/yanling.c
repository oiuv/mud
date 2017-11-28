inherit ROOM;
void create()
{
  	set ("short", "延陵西路");
  	set ("long", @LONG
从市中心往西走就到了延陵西路，这里中州城内的一条老
街。两边的房屋看上去已经很陈旧了。街道的南面的一间邻街
的房子看上去象是一家店铺。
LONG);

	set("outdoors", "zhongzhou");

  	set("exits", ([  
    		"west" : __DIR__"yanling1",
    		"south" : __DIR__"dangpu",
    		"east"  : __DIR__"shizhongxin",
	]));

        setup();
        replace_program(ROOM);
}
