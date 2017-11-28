#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "日月洞");
        set("long", @LONG
这里是星宿派总舵所在地日月洞。只见洞内灯火通明，正
中一把虎皮椅上端坐着星宿派掌门人丁春秋。洞壁上装饰着虎
皮鹿头雕羽及一些字画 (zihua)。洞两侧竖立兵器架，上面排
列的大多是各种棍棒。
LONG);
        set("exits", ([
             "south" : __DIR__"xxh2",
             "north" : __DIR__"houdong",
        ]));

        set("item_desc", ([
                "zihua" :  HIR "\n\n"
"           ※※※※※※※※※※※※※※※※※\n"
"           ※※※※　　　　　　　　　※※※※\n"
"           ※※※※　" HIW "古　威　德　星" HIR "　※※※※\n"
"           ※※※※　" HIW "今　震　配　宿" HIR "　※※※※\n"
"           ※※※※　" HIW "无　寰　天　老" HIR "　※※※※\n"
"           ※※※※　" HIW "比　宇　地　仙" HIR "　※※※※\n"
"           ※※※※　　　　　　　　　※※※※\n"
"           ※※※※※※※※※※※※※※※※※\n\n\n\n" NOR,
        ]));

        set("objects", ([
                CLASS_D("xingxiu") + "/ding" : 1,
        ]));
        set("outdoors", "xingxiu");
        setup();
        replace_program(ROOM);
}

