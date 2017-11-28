// Room: /d/suzhou/sunwuting.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "孙武亭");
	set("long", @LONG
在真娘幕后的土丘上，有一座小亭子，名为孙武亭。相传
春秋时，兵家孙武曾在此训练两队宫女，由吴王的两个宠姬分
别担任队长，由于宠姬与宫女们不听军令，虽三令五申，仍置
若罔闻，孙武遂下令，先斩两姬于军前以整军纪。后人遂筑此
亭。
LONG );
	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("exits", ([
		"south"  : __DIR__"zhenniang",
	]));
	setup();
	replace_program(ROOM);
}

