inherit ROOM;

void create()
{
	set("short", "启母阙");
	set("long", @LONG
启母阙位于嵩山南麓万岁峰下，是汉代启母庙前的神道阙，
和太室阙同为中岳汉三阙之一。
LONG );
	set("exits", ([
		"east"  : __DIR__"qimushi",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

