inherit ROOM;

void create()
{
  	set("short", "戏凤阁");
  	set("long", @LONG
这里是灵鹫宫弟子练功的地方。有几个妙龄女子正在专心
致致地练武，有几个手持竹剑，在互相拆招，身法灵动，犹如
穿花蝴蝶一般，你不禁看花了眼，别的人则坐在地上的蒲团上
苦练内力。
LONG);
  	set("exits",([
      		"west" : __DIR__"changl4",
      		"up"   : __DIR__"liangong2",
  	]));
  	set("for_family", "灵鹫宫");
  	setup();
  	replace_program(ROOM);
}
