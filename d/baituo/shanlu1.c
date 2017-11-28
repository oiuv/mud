inherit ROOM;

void create()
{
        set("short", "山路");
        set("long", @LONG
这里是白驼山庄广场西边的一条小路，寻常百姓平时都是
经过这条小路上山。
LONG);
  	set("exits", ([
      		"north" : __DIR__"shulin",
      		"south" : __DIR__"shanlu",
     	]));
  	set("outdoors", "baituo");
  	set("objects", ([
      		__DIR__"npc/qiaofu" : 1 ,
      	]));
  	setup();
  	replace_program(ROOM);
}
