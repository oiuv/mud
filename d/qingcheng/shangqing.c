// Room: /qingcheng/shangqing.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "上清宫");
	set("long", @LONG
上清宫是老君道场。宫前山门，矮树搭就，甚为灵动。宫内殿
堂古色清雅，正殿供奉太上老君、吕纯阳和张三丰塑像。山前摩崖
石刻 "天下第五名山" 气势浑厚，很是壮观。
LONG );
        set("outdoors","qingcheng");
	set("exits", ([
		"westdown" : __DIR__"sanwanjiudao",
		"westup"   : __DIR__"huyingting",
		"west"     : __DIR__"yuanyangjing",
		"east"     : __DIR__"maguchi",
		"south"    : __DIR__"songfengguan",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

