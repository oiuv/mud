#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "王盘山岛边");
        set("long", @LONG
王盘山在钱塘江口的东海之中，是个荒凉小岛，山石嶙峋
向无人居。岸边两人各举大旗，挥舞示意，只见两面大旗上均
绣着一头大鹰，双翅伸展，甚是威武。两面大旗之间站着一个
老者。王盘山是个小岛，山石树木无可观之处。
LONG);
        set("exits",([
                "southdown":__DIR__"boat2",
                "east":__DIR__"gukou",
        ]));

        set("objects",([
                 __DIR__"npc/jiaozhong1": 2,
                 __DIR__"npc/jiaozhong2": 2,
                 __DIR__"npc/bai": 1,
        ]));

        setup();
}

int valid_leave(object me, string dir)
{
        object ob = present("bai guishou");

        if (! me->query_temp("dao") && dir == "east")
                return notify_fail(HIR "\n你突然想到：此般一进会场就是生死之"
                                   "斗，前途未果。还是先\n下去砸了他们的船("
                                   HIY "break boat" HIR ")以防不测。\n" NOR);

        if (me->query_temp("dao")
           && dir == "east"
           && objectp(ob)
           && living(ob))
        {
                ob->ccommand("tnnd" + me->query("id"));
                ob->ccommand("slap3" + me->query("id"));
                message_vision(CYN "$N" CYN "喝道：竟敢砸坏我们的船只，"
                               "给我去死吧！\n" NOR, ob, me);
                ob->kill_ob(me);

                ob = present("jiao zhong");
                if (objectp(ob)) ob->kill_ob(me);

                ob = present("jiao zhong 2");
                if (objectp(ob)) ob->kill_ob(me);

                ob = present("jiao zhong 3");
                if (objectp(ob)) ob->kill_ob(me);

                ob = present("jiao zhong 4");
                if (objectp(ob)) ob->kill_ob(me);
                        return notify_fail(HIY "向东的路被白龟寿拦住了。\n" NOR);
        }
        return 1;
}
