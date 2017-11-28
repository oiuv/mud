//HSQCHANGLANG.C

inherit ROOM;

void create()
{
	set("short", "洪水旗长廊");
	set("long", @LONG
你正走在一条长廊之上, 长廊蜿蜒曲折, 两旁是如画景象. 
小河从廊下静静流淌, 河面之上飘浮着淡淡的轻烟, 如雾如纱.
但河面上又静得让人奇怪, 似乎没有一点生气.
LONG );
	set("exits", ([
		"north" : __DIR__"hsqdating",
		"out"   : __DIR__"hsqmen",
	]));
	set("outdoors", "mingjiao");
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}
