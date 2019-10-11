// Room: /d/suzhou/jubaozhai.c
// Date: May 31, 98  Java

inherit ROOM;

void create()
{
	set("short", "聚宝斋");
	set("long", @LONG
这是一家老字号的钱庄，已有几百年的历史，在全国各地
都有分店。它发行的银票信誉非常好，通行全国。
    在对面的墙上挂了块牌子(paizi)。
LONG );
//	set("outdoors", "suzhou");
	set("no_clean_up", 0);
	set("item_desc", ([
		"paizi" : @TEXT
     本钱庄提供以下服务：
      存钱        deposit或者cun
      取钱        withdraw或者qu
      钱币兑换    convert或者duihuan
      查帐        check或者chazhang
TEXT
	]) );
	set("exits", ([
		"east"  : __DIR__"nandajie1",
	]));
	set("objects", ([
		__DIR__"npc/sun": 1,
	]));
	set("no_clean_up", 0);
	set("no_fight", 1);
	set("no_beg", 1);
	setup();
	replace_program(ROOM);
}

