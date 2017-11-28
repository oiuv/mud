#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(YEL "高昌迷宫地图" NOR, ({ "map", "ditu" }));
        set_weight(200);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("unit", "张");
                set("long", WHT "\n这是一张高昌迷宫地图，依照图示，按以下方位即可进入。\n\n" HIW
                            "※※※※※※※※※※※※※※※※※※※※※※※\n"
                            "※※※" NOR + HIR "东" NOR + HIW "※" NOR + HIR "东" NOR + HIW
                            "※" NOR + HIR "南" NOR + HIW "※" NOR + HIR "东" NOR + HIW "※"
                            NOR + HIR "北" NOR + HIW "※" NOR + HIR "北" NOR + HIW "※" NOR +
                            HIR "东" NOR + HIW "※" NOR + HIR "东" NOR + HIW "※" NOR + HIR
                            "南" NOR + HIW "※※※\n"
                            "※※※※※※※※※※※※※※※※※※※※※※※\n\n" NOR);
                set("value", 10);
                set("material", "paper");
        }
}

