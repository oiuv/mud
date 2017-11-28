inherit ROOM;

void create()
{
	set("short", "禹王庙");
	set("long", @LONG
禹王庙为追念大禹治水功德，在吹台上建造，庙内的大禹
神像端身平坐，一手握着把铁锹，目注远方，来人多是祈求莫
发大水的，西下过去就是片树林。
LONG);
	set("objects", ([
  		__DIR__"npc/obj/dayu" : 1,
	]));
	set("no_clean_up", 0);
	set("exits", ([
  		"westdown" : __DIR__"yuwang",
	]));

	setup();
	replace_program(ROOM);
}
