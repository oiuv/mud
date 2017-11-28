#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "桃园篱笆");
        set("long", @LONG
你走在一条通往桃树林深处的小道上，四周非常安静，景
色怡人。前面有个篱笆(fence)门。
LONG );
        set("outdoors", "wudang");
        set("item_desc",([
                "fence" : WHT "\n\n"
                          "\t※※※※※※※※※※※※※※※\n"
                          "\t※※※※※※※※※※※※※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※　" HIM "应怜屐齿印苍苔" NOR + WHT "　※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※　" HIM "小扣柴扉久不开" NOR + WHT "　※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※　" HIM "春色满园关不住" NOR + WHT "　※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※　" HIM "一枝红杏出墙来" NOR + WHT "　※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※※※※※※※※※※※※※\n"
                          "\t※※※※※※※※※※※※※※※\n\n\n" NOR,
        ]));
        set("exits", ([
                "south" : __DIR__"tyroad10",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
