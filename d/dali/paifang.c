//Room: /d/dali/paifang.c
//Date: June. 29 1998 by Java

inherit ROOM;

void create()
{
	set("short", "牌坊");
	set("long", @LONG
这是大理城的牌坊，正中一个牌坊上写着四个金色大字: 圣道广
慈。西边是皇宫，东边是一条青石大道，由于大理国主体民如子，虽
皇宫近在咫尺，但金吾不禁，百姓往来如潮。
LONG );
        set("outdoors", "dali");
	set("exits", ([
		"east"  : __DIR__"wangfulu",
		"west"  : __DIR__"yujie",
		"south" : __DIR__"taihejiekou",
		"north" : __DIR__"northgate",
	]));
        set("objects", ([
                CLASS_D("hu") + "/huyizhi" : 1
        ]));
	setup();
	replace_program(ROOM);
}

