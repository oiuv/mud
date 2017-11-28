inherit ROOM;
string look_duilian();

#include <ansi.h>;

void create()
{
        set("short", "凌霄殿");
        set("long", 
"这里就是凌霄城的根本之地--凌霄殿。向来，不管凌霄城有
何大事，掌门都会在此召集门人，发号施令。大厅北墙上，挂着
一个老人的肖像，是当年凌霄城创派祖师的遗像。两边柱子上刻
着一幅对联(duilian)。旁边的兵器架上放满了寒光闪闪的长剑。
堂额挂着一张匾，上书四个大字。" HIW "

                  梅    雪    凌    霄
\n" NOR );
        set("item_desc",([
                "duilian"         :       (: look_duilian :),
        ]));
        set("exits", ([
                "east"  : __DIR__"fudian2",
                "west"  : __DIR__"fudian1",
                "north"  : __DIR__"qianyuan",
                "south"  : __DIR__"meiroad1",
        ]));
        set("objects", ([
                CLASS_D("lingxiao") + "/luwantong" : 1,
                __DIR__"npc/dizi" : 4,
        ]));
        set("no_clean_up", 0);
        set("valid_startroom", 1);
        setup();
        "/clone/board/lingxiao_b"->foo();
} 

string look_duilian()
{
        return
        HIR "\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "　宝　" NOR + HIR "※※            ※※" NOR + HIW "  梅  " NOR + HIR "※※\n"
        "             ※※　 　 ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  剑  " NOR + HIR "※※            ※※" NOR + HIW "  花  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  锋  " NOR + HIR "※※            ※※" NOR + HIW "  香  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  自  " NOR + HIR "※※            ※※" NOR + HIW "  自  " NOR + HIR "※※\n"
        "             ※※      ※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  磨  " NOR + HIR "※※            ※※" NOR + HIW "  苦  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  砺  " NOR + HIR "※※            ※※" NOR + HIW "  寒  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※" NOR + HIW "  出  " NOR + HIR "※※            ※※" NOR + HIW "  来  " NOR + HIR "※※\n"
        "             ※※    　※※            ※※      ※※\n"
        "             ※※※※※※※            ※※※※※※※\n"
        "             ※※※※※※※            ※※※※※※※\n\n" NOR;
}

int valid_leave(object me, string dir)
{
        object lu;

        if (dir != "east" &&
            dir != "west" &&
            dir != "north" ||
            ! objectp(lu = present("lu wantong", this_object())))
                return ::valid_leave(me, dir);

        return lu->permit_pass(me, dir);
}
