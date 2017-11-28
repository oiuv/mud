inherit ROOM;

void create()
{
        set("short", "巡捕房");
        set("long", @LONG
一走进昏暗的巡捕房，一时你啥都看不见，就觉得有点阴
森可怕。你飞快的想着自己有没做过什么伤天害理的事。
LONG);
        set("objects", ([
  		"clone/npc/xunbu" : 2,
	]));
        set("no_clean_up", 0);
        set("exits", ([
  		"east" : __DIR__"laofang",
  		"west" : __DIR__"wendingbei3",
	]));

        setup();
        replace_program(ROOM);
}
