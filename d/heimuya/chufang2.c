inherit ROOM;
void create()
{
  	set("short","厨房");
  	set("long", @LONG
这是天香堂堂后的厨房，一位美丽侍女满脸堆笑。整个房
间菜香胭脂香迷漫。
LONG);
  	set("exits",([
      		"west" : __DIR__"chitang",
  	]));

  	set("objects",([
      		__DIR__"npc/shinu" : 1,
      		__DIR__"obj/tea" : 1 + random(6),
      		__DIR__"obj/sherou" : 1 + random(4),
  	]));
  	setup();
        replace_program(ROOM);
}
