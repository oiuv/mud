inherit ROOM;

void create()
{
	set("short","长廊");
	set("long", @LONG
这里是白虎堂的长廊，被打扫得非常的干净。不时有堂中
的下人白虎堂的弟子在此走动。
LONG);
  	set("exits",([
      		"east" : __DIR__"dating2",
      		"south" : __DIR__"baistep2",
  	]));
  	set("objects",([
     		__DIR__"npc/shinu" : 2,
  	]));
  	setup();
  	replace_program(ROOM);
}
