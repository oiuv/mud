#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "钱庄");
	set("long", @LONG
这是一家老字号的钱庄，已有几百年的历史，在全国各地
都有分店。它发行的银票信誉非常好，通行全国。在对面的墙
上挂了块牌子(paizi)。
LONG);
        set("no_fight", 1);
        set("no_steal", 1);
        set("no_beg",1);
        set("item_desc", ([
                "paizi" : WHT "\n\n        ※※※※※※※※※※※\n"
                              "        ※                  ※\n"
                              "        ※     公平交易     ※\n"
                              "        ※                  ※\n"
                              "        ※  " NOR + HIW "存钱" NOR + WHT "： " NOR + HIY "deposit" NOR + WHT "  ※\n"
                              "        ※                  ※\n"
                              "        ※  " NOR + HIW "取钱" NOR + WHT "： " NOR + HIY "withdraw" NOR + WHT " ※\n"
                              "        ※                  ※\n"
                              "        ※  " NOR + HIW "兑换" NOR + WHT "： " NOR + HIY "convert" NOR + WHT "  ※\n"
                              "        ※                  ※\n"
                              "        ※  " NOR + HIW "查帐" NOR + WHT "： " NOR + HIY "check" NOR + WHT "    ※\n"
                              "        ※                  ※\n"
                              "        ※                  ※\n"
                              "        ※※※※※※※※※※※\n\n\n" NOR,
        ]));
	set("exits", ([
		"east" : __DIR__"beidajie1",
	]));
	set("objects", ([
		__DIR__"npc/qian" : 1
	]));
	setup();
	replace_program(ROOM);
}

