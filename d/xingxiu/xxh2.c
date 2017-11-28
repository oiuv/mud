#include <ansi.h>
inherit ROOM;

string look_duilian();

void create()
{
        set("short", "星宿海");
        set("long", @LONG
这里是星宿海边。说是海，其实是片湖泊和沼泽，地形十
分险恶。这里左右两厢通向星宿海的深处，南边是星宿派总舵
日月洞。洞口挂着一幅对联(duilian)。
LONG);
        set("exits", ([
             	"north" : __DIR__"riyuedong",
             	"south" : __DIR__"xxh1",
             	"northeast" : __DIR__"xxh3",
             	"northwest" : __DIR__"xxh4",
        ]));

        set("valid_startroom",1);
        set("item_desc", ([
                "duilian" : (: look_duilian :),
        ]));
        
        set("objects", ([
                 "/kungfu/class/xingxiu/dizi" : 4,
        ]));

        set("outdoors", "xingxiu");
        setup();
        "/clone/board/xingxiu_b"->foo();
}

string look_duilian()
{
        return
        RED "\n"
        "        ※※※※※※※            ※※※※※※※\n"
        "        ※※※※※※※            ※※※※※※※\n"
        "        ※※      ※※            ※※      ※※\n"
        "        ※※" NOR + HIW "　星　" NOR + RED "※※            ※※" NOR + HIW "  日  " NOR + RED "※※\n"
        "        ※※　 　 ※※            ※※      ※※\n"
        "        ※※" NOR + HIW "  宿  " NOR + RED "※※            ※※" NOR + HIW "  月  " NOR + RED "※※\n"
        "        ※※      ※※            ※※      ※※\n"
        "        ※※" NOR + HIW "  海  " NOR + RED "※※            ※※" NOR + HIW "  洞  " NOR + RED "※※\n"
        "        ※※      ※※            ※※      ※※\n"
        "        ※※" NOR + HIW "  福  " NOR + RED "※※            ※※" NOR + HIW "  洞  " NOR + RED "※※\n"
        "        ※※      ※※            ※※      ※※\n"
        "        ※※" NOR + HIW "  地  " NOR + RED "※※            ※※" NOR + HIW "  天  " NOR + RED "※※\n"
        "        ※※    　※※            ※※      ※※\n"
        "        ※※※※※※※            ※※※※※※※\n"
        "        ※※※※※※※            ※※※※※※※\n\n\n" NOR;
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (! objectp(guarder = present("xingxiu dizi", this_object())))
                return 1;

        if (dir == "north")
                return guarder->permit_pass(me, dir);
        

        return 1;
}
