inherit ROOM;

void create()
{
  	set("short", "戏凤阁三楼");
  	set("long", @LONG
这里是三楼，人比楼下的少多了，只听见楼下隐隐约约的
传来阵阵娇咤，不那么真切。
LONG);
  	set("exits",([
      		"down" : __DIR__"liangong2",
  	]));
  	set("for_family", "灵鹫宫");
  	setup();
  	replace_program(ROOM);
}
