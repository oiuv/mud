#include <ansi.h>

inherit ROOM;
string look_bian();

void create()
{
        set("short", HIY "五指堂" NOR);
        set("long", @LONG
这是一间完全用花岗岩砌成的大厅，透出阵阵逼人的寒气。整座房内没
有窗户，显得阴森黑暗。两旁的墙壁上插着松油制的火把，散发出昏黄色的
光亮，寂静的大厅中不时响起火把噼啪的燃烧声。大厅的正中摆放着帮主的
宝座，两旁分列着十几把椅子，只有遇到帮中大事时，帮主才会在这里与部
下商议。在正面的墙上挂着一面缕金的横匾(bian)。北面有一扇小门通向后
面。
LONG );

        set("item_desc", ([ 
                "bian"       :       (: look_bian :),
        ]));

        set("exits", ([ 
                "east" : __DIR__"zoulang-1",
                "southdown" : __DIR__"guangchang",
                "west" : __DIR__"zoulang-2",
                "north" : __DIR__"hxfang",
        ]));
        set("objects", ([ 
                CLASS_D("tiezhang") + "/qiuqianren" : 1,
                __DIR__"npc/xiaotong" : 2,
        ]));

        set("no_clean_up", 0);
        set("valid_startroom", 1);
        setup();
}

string look_bian()
{
    return
    "\n"
              HIY "          ####################################\n"
                  "          ####                            ####\n"
                  "          ####    五    指    擎    天    ####\n"  
                  "          ####                            ####\n"
                  "          ####################################\n\n\n\n\n\n\n" NOR
    "\n";
}
