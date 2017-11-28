#include <ansi.h>
inherit ROOM;

string look_duilian();

void create()
{
        set("short", "南天门");
        set("long", 
"到了南天门，才能望到衡山第一的祝融峰。南天门是花岗\n岩做成的石碑坊，"
"中门镌有「" HIC " 南天门 " NOR "」三字横额，左右二门\n的门楣上，分"
"别刻有「" HIW "行云" NOR "」和「" HIW "施雨" NOR "」二字。楹联(lian)破"
"\n陋，显见岁月已久。\n"
);
        set("item_desc",([
                "lian" : (: look_duilian :),
        ]));
        set("exits", ([
                "eastup"    : __DIR__"liuyunping",
                "northeast" : __DIR__"shiziyan",
                "northwest" : __DIR__"shanlu14",
                "southeast" : __DIR__"denggaotai",
                "southwest" : __DIR__"shanlu13",
        ]));
 
        set("objects", ([
                __DIR__"npc/dizi1" :  4,
        ]));

        set("outdoors", "henshan");
        setup();
        //replace_program(ROOM);
}

string look_duilian()
{
        return
        HIC "\n"
        "\t※※※※※※※        ※※※※※※※\n"
        "\t※※※※※※※        ※※※※※※※\n"
        "\t※※      ※※        ※※      ※※\n"
        "\t※※" NOR + WHT "　门　" HIC "※※        ※※" NOR + WHT "  路  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" NOR + WHT "　可　" HIC "※※        ※※" NOR + WHT "  承  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" NOR + WHT "　通　" HIC "※※        ※※" NOR + WHT "  绝  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" NOR + WHT "　天　" HIC "※※        ※※" NOR + WHT "  顶  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIW "　仰　" HIC "※※        ※※" HIW "  俯  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIW "　观　" HIC "※※        ※※" HIW "  瞰  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIW "　碧　" HIC "※※        ※※" HIW "  翠  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIW "　落　" HIC "※※        ※※" HIW "  微  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIW "　星　" HIC "※※        ※※" HIW "  峦  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIW "　辰　" HIC "※※        ※※" HIW "  屿  " HIC "※※\n"
        "\t※※　 　 ※※        ※※      ※※\n"
        "\t※※" HIW "　近　" HIC "※※        ※※" HIW "  低  " HIC "※※\n"
        "\t※※    　※※        ※※      ※※\n"
        "\t※※※※※※※        ※※※※※※※\n"
        "\t※※※※※※※        ※※※※※※※\n\n" NOR;
}
