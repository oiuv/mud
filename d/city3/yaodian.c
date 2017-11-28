inherit ROOM;

void create()
{
	set("short", "济世堂药店");
	set("long", @LONG
济世堂药店卖很多中原买不到的药。托唐门的福，生意一
直都很好。一走进这家药店，就闻到股浓烈刺鼻的药味。你正
奇怪药店伙计怎麽能忍受，就看到药店里还有一些人正拿奇怪
的眼光看你。他们的腰间鼓鼓囊囊的，显然不是好惹的。
LONG);
	set("objects", ([
		__DIR__"npc/huoji" : 1,
	]));
	set("exits", ([
		"southeast" : __DIR__"westroad3",
	]));
	setup();
	replace_program(ROOM);
}
