inherit ROOM;

void create()
{
	set("short", "崇圣门");
	set("long", @LONG
但见崇圣门前古神库有四座镇库铁人，高达丈许，振臂握
拳，怒目挺胸，身姿雄健。向北就是中岳庙最大的殿宇中岳大
殿了。
LONG );
	set("exits", ([
		"north" : __DIR__"dadian",
		"south" : __DIR__"tianzhongge",
	]));
	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

