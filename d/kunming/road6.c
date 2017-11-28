#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "长江南岸");
        set("long", @LONG
你快步来到了长江南岸，只见这里波涛滚滚，滔滔江水向
东流去。岸边立有一块碑(bei)，前面不远处有座独木桥。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "south" : __DIR__"road7", 
                "north"  :__DIR__"qiao3",
        ]));
        set("item_desc", ([
                "bei" : WHT "\n\n\n            ※※※※※※※※※※※※※※※※\n"
                        "            ※                            ※\n"
                        "            ※" NOR + HIW "     通      天      河" NOR +
                        WHT "     ※\n"
                        "            ※                            ※\n"
                        "            ※※※※※※※※※※※※※※※※\n\n\n" NOR,
        ]));
        setup();
       
        replace_program(ROOM);
}
