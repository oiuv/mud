#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "客店");
        set("long", @LONG
这是一家价钱低廉的客栈，生意非常兴隆。外地游客多选
择这里落脚，你可以在这里打听到各地的风土人情。店小二里
里外外忙得团团转，接待着南腔北调的客人。客店的主人从不
露面。墙上挂着一个牌子。
LONG);
        set("no_fight", 1);
        set("valid_startroom", 1);
        set("no_sleep_room",1);

        set("item_desc", ([
                "paizi" : WHT "\n\n        ※※※※※※※※※※※※※※※※※\n"
                              "        ※                              ※\n"
                              "        ※    " NOR + HIW "楼上雅房，每夜十两白银。" NOR + WHT "  ※\n"
                              "        ※                              ※\n"
                              "        ※※※※※※※※※※※※※※※※※\n\n\n" NOR,
        ]));

        set("objects", ([
                __DIR__"npc/xiaoer1" : 1,
        ]));

        set("exits", ([
                "north" : __DIR__"majiu",
                "south" : __DIR__"dongjie",
                "up"    : __DIR__"kedian2",
        ]));
        setup();
}

int valid_leave(object me, string dir)
{

        if (! me->query_temp("rent_paid") && dir == "up")
                return notify_fail(CYN "店小二一下挡在楼梯前，白眼一翻：怎"
                                   "麽着，想白住啊？\n" NOR);

        if (me->query_temp("rent_paid") && dir == "south")
                return notify_fail(CYN "店小二跑到门边拦住：客官已经付了银"
                                   "子，怎麽不住店就走了呢！\n" NOR);

        return ::valid_leave(me, dir);
}
