inherit ROOM;

void create()
{
	set("short", "小溪");
	set("long", @LONG
冰块闪耀之中，忽见夹杂有花瓣飘流，溪水芳香，当是上
游有花之故，沿溪水向上游行去。渐行溪流渐大。沙漠中的河
流大都上游水大，到下游水流逐渐被沙漠吸干，终于消失。但
见溪旁树木也渐渐多了。
LONG);
        set("outdoors", "shenfeng");
	set("exits", ([
  		"north" : __DIR__"lake3",
  		"south" : __DIR__"lake1",
	]));

	setup();
	replace_program(ROOM);
}
