inherit ROOM;

void create()
{
	set("short", "天下钱庄");
	set("long", @LONG
天下钱庄是京城里最大的一所钱庄，已经有过百年的历史了，信誉相当
的好。钱庄的大门正对着一个高高的柜台，钱庄的老板正在柜台后面清理着
帐目，柜台左边的墙上挂着一个牌子(paizi)。
LONG );
	set("item_desc", ([
        "paizi" : "\n本庄有利息，至少百分之一。\n
      存钱        deposit或者cun\n
      取钱        withdraw或者qu\n
      钱币兑换    convert或者duihuan\n
      查帐        check或者chazhang\n",
	]));
	set("exits", ([
		"south" : __DIR__"di_5",
	]));
	set("no_clean_up", 0);
	set("no_fight", 1);
	set("no_beg", 1);
	set("objects", ([
		__DIR__"npc/tiegongji" : 1
	]));

	setup();
	replace_program(ROOM);
}

