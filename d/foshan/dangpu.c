#include <ansi.h>
inherit ROOM;

void create()
{
	set("short","英雄典当");
	set("long",@LONG
当铺里一张高高的柜台，柜台后面坐着当铺的朝奉。这家
当铺是凤老爷所开，十多年来从没人来闹过事，朝奉也就很放
心。柜台上挂着一个木牌子(paizi)。
LONG);
        set("no_fight", 1);
        set("no_steal", 1);
        set("no_beg", 1);
        set("item_desc", ([
                "paizi" : WHT "\n\n        ※※※※※※※※※※※\n"
                              "        ※                  ※\n"
                              "        ※     公平交易     ※\n"
                              "        ※                  ※\n"
                              "        ※  " NOR + HIW "卖出" NOR + WHT "：   " NOR + HIY "sell" NOR + WHT "   ※\n"
                              "        ※                  ※\n"
                              "        ※  " NOR + HIW "买进" NOR + WHT "：   " NOR + HIY "buy" NOR + WHT "    ※\n"
                              "        ※                  ※\n"
                              "        ※  " NOR + HIW "估价" NOR + WHT "：   " NOR + HIY "value" NOR + WHT "  ※\n"
                              "        ※                  ※\n"
                              "        ※                  ※\n"
                              "        ※※※※※※※※※※※\n\n\n" NOR,
        ]));

	set("objects", ([
	        __DIR__"npc/chaofeng": 1,
	]));

	set("exits", ([
	        "north"  : __DIR__"street5",
	]));
	setup();
	replace_program(ROOM);
}
