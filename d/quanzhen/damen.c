#include <ansi.h>
#include <room.h>
inherit ROOM;

string look_duilian();

void create()
{
        set("short", "全真教大门");
        set("long",
"你已走到了终南山半山腰，来到全真教的总部重阳宫。殿
宇依山而筑，高低错落有致。门上挂着一块匾上面写着：

           " WHT "※※※※※※※※※※※※※※※※
           ※                            ※
           ※" NOR + HIW "     重      阳      宫" NOR + WHT "     ※
           ※                            ※
           ※※※※※※※※※※※※※※※※" NOR "

几个大字。门前的石柱上挂着一副对联 (duilian)。周围古木
森森，翠竹成林，景色清幽。正前方黄墙碧瓦飞檐翘檩，正中
有一道二丈来宽三丈来高的朱红杉木包铜大门。\n");

        set("exits", ([
                "east" : __DIR__"datang1",
                "westdown" : __DIR__"jiaobei",
        ]));

        set("item_desc", ([
                "duilian" : (: look_duilian :),
        ]));

        set("objects",([
                __DIR__"npc/zhike" : 1,
        ]));
        create_door("east", YEL "包铜大门" NOR, "west", DOOR_CLOSED);
        set("outdoors", "quanzhen");
        setup();
}

string look_duilian()
{
        return
        HIR "\n"
        "       ※※※※※※※            ※※※※※※※\n"
        "       ※※※※※※※            ※※※※※※※\n"
        "       ※※      ※※            ※※      ※※\n"
        "       ※※" NOR + HIW "　一　" NOR + HIR "※※            ※※" NOR + HIW "  地  " NOR + HIR "※※\n"
        "       ※※　 　 ※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  生  " NOR + HIR "※※            ※※" NOR + HIW "  法  " NOR + HIR "※※\n"
        "       ※※      ※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  二  " NOR + HIR "※※            ※※" NOR + HIW "  天  " NOR + HIR "※※\n"
        "       ※※      ※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  二  " NOR + HIR "※※            ※※" NOR + HIW "  天  " NOR + HIR "※※\n"
        "       ※※      ※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  生  " NOR + HIR "※※            ※※" NOR + HIW "  法  " NOR + HIR "※※\n"
        "       ※※    　※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  三  " NOR + HIR "※※            ※※" NOR + HIW "  道  " NOR + HIR "※※\n"
        "       ※※    　※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  三  " NOR + HIR "※※            ※※" NOR + HIW "  道  " NOR + HIR "※※\n"
        "       ※※      ※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  生  " NOR + HIR "※※            ※※" NOR + HIW "  法  " NOR + HIR "※※\n"
        "       ※※    　※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  万  " NOR + HIR "※※            ※※" NOR + HIW "  自  " NOR + HIR "※※\n"
        "       ※※    　※※            ※※      ※※\n"
        "       ※※" NOR + HIW "  物  " NOR + HIR "※※            ※※" NOR + HIW "  然  " NOR + HIR "※※\n"
        "       ※※    　※※            ※※      ※※\n"
        "       ※※※※※※※            ※※※※※※※\n"
        "       ※※※※※※※            ※※※※※※※\n\n" NOR;
}
