#include <ansi.h>
#include <room.h>
inherit ROOM;

string look_duilian();

void create()
{
        set("short", HIB "【轮回道】" NOR);
        set("long", HIB @LONG

                    轮         回         道

    轮回道上寒气森森的，青石铺设的地面满是灰尘。四周一片寂静，偶
尔传来几声冤魂野鬼的恸哭声，使气氛显得格外的恐怖诡异。你的面前是
一座雄伟的大殿，殿堂的高匾上写着「轮回司」三个大字，匾下有一幅残
缺不全的对联(duilian)。轮回司巨大厚实的铜门(door)紧紧关闭着。

LONG NOR );

        set("exits", ([
                "enter" : __DIR__"lunhuisi",
                "west"  : __DIR__"jimiesi",
        ]));

        set("item_desc", ([
                "door" : YEL "一扇厚厚的铜门，上面布满了蛛网和灰尘。\n" NOR,
                "duilian" :       (: look_duilian :),
        ]));

        create_door("enter", YEL "铜门" NOR, "out", DOOR_CLOSED);
        setup();
}

string look_duilian()
{
        return
        RED "\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "　天　" NOR + RED "※※            ※※" NOR + HIW "  血  " NOR + RED "※※\n"
        "             ※※　 　 ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  地  " NOR + RED "※※            ※※" NOR + HIW "  脉  " NOR + RED "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  崩  " NOR + RED "※※            ※※" NOR + HIW "  呈  " NOR + RED "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  裂  " NOR + RED "※※            ※※" NOR + HIW "  现  " NOR + RED "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  时  " NOR + RED "※※            ※※" NOR + HIW "  间  " NOR + RED "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n" NOR;
}
