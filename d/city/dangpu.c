#include <ansi.h>
inherit ROOM;

void create()
{
	set("short", "当铺");
	set("long", @LONG
这里是扬州城内一家以买卖公平著称的当铺，一个五尺高
的柜台挡在你的面前，柜台上摆着一个牌子 (paizi)，柜台后
坐着唐老板，一双精明的上上下下打量着你。
LONG);
	set("no_fight", 1);
	set("no_steal", 1);
	set("no_beg",1);
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
		__DIR__"npc/tang" : 1,
	]));
	set("exits", ([
		"west" : __DIR__"nandajie1",
	]));

	setup();
	replace_program(ROOM);
}
