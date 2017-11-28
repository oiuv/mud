inherit ROOM;

void create()
{
  	set ("short", "三叉路口");
  	set ("long", @LONG
道路至此分为三路，一条路向北就是开封城，东南面是座
树林。林中隐有条小道穿过。西南面的路通向野猪林。
LONG);

  	set("outdoors", "kaifeng");
  	set("exits", ([
  		"southwest" : __DIR__"dadao2",
  		"southeast" : __DIR__"shulin",
  		"north" : __DIR__"dadao",
	]));

  	setup();
  	replace_program(ROOM);
}
