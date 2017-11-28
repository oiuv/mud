// Room: /d/suzhou/erxianting.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "二仙亭");
	set("long", @LONG
二仙亭在千人石东侧，建于北宋。亭壁嵌两方石碑，分别
刻着五代宋初陈抟与唐代吕洞宾二仙像。亭柱上有两幅石刻楹
联：“梦中说梦原非梦，元里求元便是元”；“昔日岳阳曾显
迹，今朝虎阜再留踪”。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"west"  : __DIR__"qianrenshi",
		"north" : __DIR__"bailianchi",
	]));
	setup();
	replace_program(ROOM);
}

