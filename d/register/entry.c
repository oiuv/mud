#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", HIW "世外桃源" NOR);
       set("long", HIW @LONG

                    世     外     外     源

    只见这里桃花如画，春意盎然。小桥流水，落英缤纷，好一番诗情
雅意。河边耸立着一块大石，一位女子轻妆素裹，倚石凝眉，似乎有着
说不尽的哀思。旁边一位男子英武挺拔，傲然而立。大石的旁边有一块
牌子(paizi)，你也许应该仔细看看。


LONG NOR );
        set("no_fight", 1);
        set("item_desc", ([
                "paizi" : WHT "请先注册(" NOR + HIY "register email" NOR +
                          WHT ")邮件，然后你可以分别去不同的出口选择你的内在品质。\n" NOR,
        ]));
        set("objects", ([
                __DIR__"npc/shuisheng" : 1,
                __DIR__"npc/diyun"     : 1,
        ]));
        set("exits", ([
                "east"  : __DIR__"roome",
                "south" : __DIR__"rooms",
                "west"  : __DIR__"roomw",
                "north" : __DIR__"roomn",
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
        object ob;
        if (! objectp(ob = present("shui sheng", this_object())))
        {
                ob = new(__DIR__"npc/shuisheng");
                ob->move(this_object());
        }

        if (! me->query("registered"))
        {
                message_vision(CYN "水笙轻声对$N" CYN "说：您还没有注册呢，请先注册(" NOR +
                               HIY "register" NOR + CYN ")再离去好吗？\n" NOR, me);

                if (me->query_temp("email"))
                        return notify_fail(HIR "如果你确认输入的地址，就决定(" NOR + HIY
                                           "decide" NOR + HIR ")吧。\n" NOR);

                return notify_fail(HIY "你还不快注册？\n" NOR);
        }

        if (! objectp(ob = present("di yun", this_object())))
        {
                ob = new(__DIR__"npc/diyun");
                ob->move(this_object());
        }
        message_vision(CYN "狄云对$N" CYN "一抱拳，道：人生路全靠自己走，朋友走好！\n" NOR, me);

        return 1;
}
