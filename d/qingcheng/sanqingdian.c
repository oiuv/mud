// Room: /qingcheng/sanqingdian.c
// Date: Frb.20 1998 by Java

inherit ROOM;
void create()
{
	set("short", "三清殿");
	set("long", @LONG
古常道观的中心是三清殿。殿中供奉三清教主：玉清原始天尊、
上清灵宝天尊和太清太上老君。原始天尊手拿圆珠，象征洪元；灵
宝天尊怀抱太极图，象征混元；太上老君手持扇子，象征太初。殿
旁有一对联(lian)，著墨极浓。
LONG );
	set("exits", ([
		"south"    : __DIR__"tianshidong",
	]));
	set("item_desc", ([
		"lian"    : 
"\n
     一      地
     生      法
     二      天
     二      天
     生      法
     三      道
     三      道
     生      法
     万      自
     物      然
\n",
	]));
        set("no_clean_up", 0);
	setup();
	replace_program(ROOM);
}

