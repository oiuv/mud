inherit ROOM;

void create()
{
  	set("short","长廊");
  	set("long", @LONG
这里是非常气派的长廊。但是却没什么人在这里，南边是
青龙堂的大厅。
LONG);

  	set("exits",([
      		"north" : __DIR__"chlang1",
      		"south" : __DIR__"qing",
  	]));
  	set("no_clean_up", 0);
  	setup();
  	replace_program(ROOM);
}
