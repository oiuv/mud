#include <ansi.h>
#include <room.h>
inherit ROOM;

void create()
{
        set("short", "帐房");
        set("long", @LONG
这里是武馆内的一个帐房，室内一个帐房先生在这里认真
地做着帐。几名新弟子正围着帐房先生，看来是想把积攒下来
的钱物存在这里。墙上挂有一个牌子(paizi)。
LONG);
        set("no_fight", 1);
        set("exits", ([
                "north" : __DIR__"guofu_shilu-1",
        ]));
        set("objects", ([
                __DIR__"npc/fan" : 1,
        ]) );
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
        setup();
        replace_program(ROOM);
}
