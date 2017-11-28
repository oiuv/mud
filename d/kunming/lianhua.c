#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "莲花峰");
        set("long", @LONG
你爬上莲花峰，整个石林的风光尽收眼底，眼见北边不远
刻有一大字(zi)，峰壁上刻有一小诗 (shi)，向下观望，只见
脚下一潭碧水荡漾。奇景迭出，险象环生，峰回路转，异境天
开，常使人心动神驰，乐而忘返矣。
LONG);
        set("outdoors", "kunming");

        set("exits", ([                
                "southdown" : __DIR__"shilin2",
                "up" : __DIR__"wfting",
        ]));

        set("item_desc", ([
                     "zi" : WHT "\n         ※※※※ \n"
                             "         ※    ※ \n"
                             "         ※ 天 ※ \n"
                             "         ※    ※ \n"
                             "         ※ 下 ※ \n"
                             "         ※    ※ \n"
                             "         ※ 第 ※ \n"
                             "         ※    ※ \n"
                             "         ※ 一 ※ \n"
                             "         ※    ※ \n"
                             "         ※ 奇 ※ \n"
                             "         ※    ※ \n"
                             "         ※ 观 ※ \n"
                             "         ※    ※ \n"
                             "         ※※※※ \n\n\n" NOR,

                     "shi" : HIR "\n\n\n            攀登直欲夺天工\n\n"
                             "            一顶凌云挈众峰\n\n"
                             "            不是猱升挥汗水\n\n"
                             "            何来双手抚晴空\n\n\n" NOR,
                  ]));

        set("objects", ([
                "/d/beijing/npc/youke" : 1,
        ]));
        setup();
        replace_program(ROOM);
}
