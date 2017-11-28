#include <ansi.h>
#include <room.h>

inherit ROOM;

void create()
{
        set("short", GRN "瓜架" NOR);
        set("long", @LONG
转过一个小弯，忽然眼前一绿，面前是一片很大的瓜架。在高大的木架
旁，种植着一些蔬菜和瓜类，架子上已经爬满了各种各样的植物，从茂密的
叶子中，垂下各种已经成熟的果实，丝瓜，苦瓜，葫芦……还有一些叫不出
名称的瓜果也缠杂在其中。
LONG    );
        set("exits", ([
                "southeast" : __DIR__"shuijing",
                "west" : __DIR__"guangchang",
        ]));

        set("objects", ([
                CLASS_D("tiezhang") + "/qiuqianzhang" : 1,
        ]));

        set("no_clean_up", 0);
        set("hulu_count", 5);
        set("outdoors", "tiezhang");

        setup();
}
