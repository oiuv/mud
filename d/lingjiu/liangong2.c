inherit ROOM;

void create()
{
  	set("short", "戏凤阁二楼");
  	set("long", @LONG
这里是灵鹫宫弟子练功的地方。有几个妙龄女子正在专心
致致地练武，有几个手持竹剑，在互相拆招，身法灵动，犹如
穿花蝴蝶一般，你看了也忍不住跃跃欲试。
LONG);
  	set("exits",([
      		"down" : __DIR__"liangong",
      		"up"   : __DIR__"liangong3",
  	]));
  	set("for_family", "灵鹫宫");
  	setup();
  	replace_program(ROOM);
}
