inherit ROOM;

void create()
{
  	set("short", "林间小道");
  	set("long", @LONG
你走在一条颇为阴暗的林间小道上，两旁是阴森森的密树
林。一阵阵风吹过树梢，发出沙沙的响声，令你不寒而栗。不
过西边好象是一个山谷。 
LONG);
        set("outdoors", "heimuya");
  	set("exits",([
      		"south" : __DIR__"linjxd2",
      		"north" : __DIR__"linjxd3",
      		"east"  : __DIR__"linjxd4",
      		"west"  : __DIR__"guang",
  	]));
  	set("no_clean_up", 0);
  	setup();
  	replace_program(ROOM);
}
