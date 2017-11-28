
inherit ROOM;

void create()
{
	set("short", "月台");
	set("long", @LONG
这里便是法王寺的月台。从月台东望，太室山峦高耸入云，
寺东有双峰插云，中间阙如。因名 "嵩门" 。中秋佳节，明月
自峰中升起，正当嵩门之中，银光洒满山谷，这就是登封八景
之一的「嵩门待月」。
LONG );
	set("exits", ([
		"east" : __DIR__"fawangsi",
	]));
	set("no_clean_up", 0);
	set("outdoors", "songshan");
	setup();
	replace_program(ROOM);
}

