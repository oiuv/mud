inherit ROOM;

void create()
{
	set("short", "碎石路");
	set("long", @LONG
一条碎石小路，刚下过雨，路面看起来还满干净的．一些乡下人挑着
自己种的蔬菜到城里来卖，人不是很多，吆喝声传出很远。路中央有一两
个乞丐正在行乞，无家可归的人正四处游荡，从这里可以看出洛阳的另一
面。路的两边都是当地的一些民宅。
LONG);
        set("outdoors", "luoyang");
        set("no_clean_up", 0);
        set("exits", ([
  		"south" : __DIR__"suishi3",
  		"north" : __DIR__"suishi1",
	]));

	setup();
	replace_program(ROOM);
}
