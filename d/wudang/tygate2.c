#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "桃园木门");
        set("long", @LONG
你走在一条通往桃树林深处的小道上，四周非常安静，景
色怡人。前面有个桃木门(gate)。
LONG);
        set("outdoors", "wudang");
        set("item_desc",([
                "gate" : WHT "\n\n"
                          "\t※※※※※※※※※※※※※※※\n"
                          "\t※※※※※※※※※※※※※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※　" HIM "去年今日此门中" NOR + WHT "　※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※　" HIM "人面桃花相映红" NOR + WHT "　※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※　" HIM "人面不知何处去" NOR + WHT "　※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※　" HIM "桃花依旧笑春风" NOR + WHT "　※※※\n"
                          "\t※※※　　　　　　　　　※※※\n"
                          "\t※※※※※※※※※※※※※※※\n"
                          "\t※※※※※※※※※※※※※※※\n\n\n" NOR,
        ]));
        set("exits", ([
                "north" : __DIR__"tyroad10",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
