inherit ROOM;
#include <ansi.h>

string look_duilian();
string look_bian();

void create()
{
        set("short", "书房大门");
        set("long",@LONG
这是书房门口，只见大门旁贴着副对联 (duilian)，抬头
上望。门楣上一块大匾(bian)上写着几个大字。
LONG);
        set("outdoors", "lingjiu");
        set("exits", ([
                "east" : __DIR__"shufang",
                "west" : __DIR__"changl12",
        ]));
        set("objects",([
                CLASS_D("lingjiu") + "/zhujian" : 1,
        ]));
        set("item_desc", ([
                "duilian" :       (: look_duilian :),
                "bian"    :       (: look_bian :),
        ]));
        setup();
}

string look_duilian()
{
        return
        HIR "\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "　行　" NOR + HIR "※※            ※※" NOR + HIW "  坐  " NOR + HIR "※※\n"
        "             ※※　 　 ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  到  " NOR + HIR "※※            ※※" NOR + HIW "  看  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  水  " NOR + HIR "※※            ※※" NOR + HIW "  云  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  穷  " NOR + HIR "※※            ※※" NOR + HIW "  起  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  处  " NOR + HIR "※※            ※※" NOR + HIW "  时  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n\n" NOR;
}

string look_bian()
{
    return
    "\n"
              HIY "               ####################################\n"
                  "               ####                            ####\n"
                  "               ####    任    我    逍    遥    ####\n"  
                  "               ####                            ####\n"
                  "               ####################################\n\n\n\n\n\n\n" NOR;
    "\n";
}

int valid_leave(object me, string dir)
{
        object guarder;

        if (dir != "east")
                return 1;

        if (objectp(guarder = present("zhu jian", environment(me))))
                return guarder->permit_pass(me, dir);

        return 1;
}
