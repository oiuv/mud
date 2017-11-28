#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "钱庄");
        set("long", @LONG
这是中州城内一家老字号钱庄，据说这里的信誉很好。几
个伙计在柜台上忙着。柜台上还有一块牌子 (paizi)，因是干
钱的营生，这里的保镖身手不凡，让你打不到什么坏主意。
LONG);
        set("no_fight", 1);
        set("no_steal", 1);
        set("no_beg",1);
        set("exits", ([
                "east" : __DIR__"wendingnan1",
                 
        ]));
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

        set("objects" , ([
                __DIR__"npc/yaodezhong":1,
        ]));

        setup();
        replace_program(ROOM);
}

