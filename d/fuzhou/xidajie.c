// Room: /d/fuzhou/xidajie.c
// may. 12 1998 Java

inherit ROOM;

void create()
{
	set("short", "西大街");
	set("long", @LONG
大街北面，一座结构宏伟的建筑前，左右石坛上各插着
一根两丈多高的旗杆，杆上青旗飘扬。右首旗子用金线绣着
一头张牙舞爪的狮子，旗风招展，奕奕如生。雄狮上头有一
对黑丝线绣的蝙蝠展翅飞翔。左首旗子上写着“福威镖局”
四个黑字，银钩铁划，刚劲非凡。
LONG );

	set("exits", ([
		"southup" : __DIR__"wushan",
		"north"   : __DIR__"biaoju",
		"east"    : __DIR__"dongjiekou",
		"west"    : __DIR__"ximendajie",
	]));
	set("outdoors", "fuzhou");
	setup();
	replace_program(ROOM);
}

