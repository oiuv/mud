inherit ROOM;

void create()
{
  	set("short","池塘");
  	set("long", @LONG
这里是天香堂堂后的一个小池塘，池塘里有数对鸳鸯悠游
其间，池边还有四只白鹤在觅食。
LONG);

  	set("exits",([
      		"north" : __DIR__"tian1",
      		"west"  : __DIR__"shenggu",
      		"east"  :__DIR__"chufang2",
  	]));
  	setup();
  	replace_program(ROOM);
}
