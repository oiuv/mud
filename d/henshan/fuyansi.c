#include <ansi.h>
inherit ROOM;

string look_duilian();

void create()
{
        set("short", "福严寺");
        set("long", 
"福严寺为禅宗七祖怀让的道场，怀让曾在此宏扬顿悟法门。\n山门的上匾额"
"「" HIR "天下法院" NOR "」正是当年写照，两边门联「" HIW "六朝古\n"
"刹  七祖道场" NOR "」字迹剥落颜色极古。只见山门的墙边上有古人\n留字(zi)"
"，年代古远，犹历历可辩。福严寺内的石柱上有一对\n联(lian)，字迹圆润回转，不"
"露机锋。\n"
);
        set("exits", ([ 
                "southdown"  : __DIR__"shanlu9",
                "westup"     : __DIR__"sansheng",         
        ]));

        set("objects", ([
                __DIR__"npc/xiangke" : 2,
        ]));        

        set("item_desc", ([
            "zi":
HIW"\n
          诸峰翠少中峰翠  五寺名高此寺名
          石路险盘岚霭滑  僧窗高倚济寥明
          凌空殿阁由天设  遍地松杉是自生
          更有上方难上处  紫苔红藓远峥嵘
\n\n"NOR,
            "lian" : (: look_duilian :),

        ]));

        set("no_clean_up", 0);

        setup();
        //replace_program(ROOM);
}


string look_duilian()
{
        return
        HIR "\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "　福　" NOR + HIR "※※            ※※" NOR + HIW "  般  " NOR + HIR "※※\n"
        "             ※※　 　 ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  严  " NOR + HIR "※※            ※※" NOR + HIW "  若  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  为  " NOR + HIR "※※            ※※" NOR + HIW "  为  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  南  " NOR + HIR "※※            ※※" NOR + HIW "  老  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  山  " NOR + HIR "※※            ※※" NOR + HIW "  祖  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  第  " NOR + HIR "※※            ※※" NOR + HIW "  不  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  一  " NOR + HIR "※※            ※※" NOR + HIW "  二  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  古  " NOR + HIR "※※            ※※" NOR + HIW "  法  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  刹  " NOR + HIR "※※            ※※" NOR + HIW "  门  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n\n" NOR;
}





