#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "锦城驿");
        set("long", @LONG
锦城驿是全西南最大的客店，生意非常兴隆。外地游客多
选择这里落脚，你可以在这里打听到各地的风土人情。店小二
里里外外忙得团团转，沉重的川味官话你是实在听不顺耳。这
是成都督府官办的客栈，接待着各地入川的官差浪人。墙上挂
着一个牌子(paizi)。
LONG );
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
                __DIR__"npc/xiaoer" : 1,
        ]));
        set("exits", ([
                "northwest" : __DIR__"southroad1",
                "up"        : __DIR__"kedian2",
                "east"      : __DIR__"majiu",
        ]));
        setup();
        "/clone/board/kedian3_b"->foo();
}

int valid_leave(object me, string dir)
{

        if (! me->query_temp("rent_paid") && dir == "up")
                return notify_fail(CYN "店小二一下挡在楼梯前，白眼一翻：怎麽着，想白住啊？\n" NOR);

        if (me->query_temp("rent_paid") && dir == "west")
                return notify_fail(CYN "店小二跑到门边拦住：客官已经付了银子，怎麽不住店就走了呢！\n" NOR);

        return ::valid_leave(me, dir);
}
