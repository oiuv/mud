// Room: /qingcheng/jianfugong.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "建福宫");
	set("long", @LONG
建福宫旧称丈人观，以其座落丈人峰下故也。相传五岳丈人宁
封子修道于此。院内树木假山，相互掩映；周围林木苍翠，浓荫蔽
日，炎夏来此，十分凉爽。这里也是上山的起点。
LONG );
	set("exits", ([
		"south"     : __DIR__"xiaoqiao",
		"northwest" : __DIR__"path1",
	]));
	set("objects", ([
		__DIR__"npc/ji" : 1,
		__DIR__"npc/shen" : 1,
	]));
//	set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

