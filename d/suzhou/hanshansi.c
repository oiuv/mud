inherit ROOM;

void create()
{
	set("short", "寒山寺");
	set("long", @LONG
你走出西门约三十里地处，就到了枫桥镇，在唐元和年间，
有高僧寒山子曾来此居住，后希迁禅师在此建寺院时，更名寒
山寺。唐开元年间，诗人张继赴京应试落第，返途舟船停靠枫
桥，赋诗一首：“月落乌啼霜满天，江枫渔火对愁眠，姑苏城
外寒山寺，夜半歌声到客船”。从此，诗韵钟声，脍炙人口，
寺因诗而名扬天下。
LONG );
	set("no_clean_up", 0);
	set("exits", ([
		"south" : __DIR__"road4",
		"enter" : __DIR__"zhengdian",
	]));
	setup();
	replace_program(ROOM);
}

