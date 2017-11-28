#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "当铺");
        set("long", @LONG
这是周松天开的当铺。这当铺可能和官府有勾结。在这里
不管你的东西的来路如何都照收。你也可以看看有什么东西你
需要也可以去买一点。不过价钱可能比其他地方要贵一点。柜
台的墙上挂着一个牌子(paizi)。
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
  		__DIR__"npc/zhousongtian" : 1,
  		__DIR__"npc/yitai" : 1,
	]));

        set("exits", ([
  		"north" : __DIR__"yanling",
	]));

        setup();
        replace_program(ROOM);
}
