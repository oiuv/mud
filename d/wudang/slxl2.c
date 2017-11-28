#include <ansi.h>
inherit ROOM;

string look_shibei();

void create()
{
        set("short", "松林小路");
        set("long", @LONG
这是山脚松林中的小路，两边长满参天的红松树，只能看
见一线天空。路旁有道士在奋力砍树。东边可回大道。路边有
个石碑(shibei)，很多游客在围那里。原来西边上去就是名镇
天下的解剑岩了，
LONG);
        set("outdoors", "wudang");
        set("item_desc", ([
                "shibei" : (: look_shibei :),
        ]));
        set("exits", ([
                "westup" : __DIR__"jiejianyan",
                "east"   : __DIR__"slxl1",
                "south"  : __DIR__"songlin1",
                "north"  : __DIR__"songlin2",
        ]));
        set("no_clean_up", 0);
        setup();
}

string look_shibei()
{
        return WHT "\n\n"
        "  ※※※※※※※※※※※※※※※※※※※※※※※※※\n"
        "  ※※※※　        　　　　　　　　　　　　※※※※\n"
        "  ※※※※" HIW "　        　武当派通告" NOR + WHT "    　　　　※※※※\n"
        "  ※※※※　                            　　※※※※\n"
        "  ※※※※" HIW "　    往前就是武当山解剑岩。所有" NOR + WHT "　※※※※\n"
        "  ※※※※" HIW "　外来人客请自觉解剑。邪魔外道到" NOR + WHT "　※※※※\n"
        "  ※※※※" HIW "　此止步。" NOR + WHT "                　　　　※※※※\n"
        "  ※※※※　　　　　                　　　　※※※※\n"
        "  ※※※※※※※※※※※※※※※※※※※※※※※※※\n\n\n" NOR;
}
