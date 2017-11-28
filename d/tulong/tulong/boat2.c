#include <ansi.h>
inherit ROOM;

void create()
{
        set("short","船上");
        set("long", @LONG
这些大船，想是巨鲸帮、海沙派一干人的座船。
LONG );
        set("exits",([
                "northup":"/d/tulong/tulong/daobian",
        ]));

        set("objects",([
                 "/d/tulong/tulong/obj/stone": 1,
        ]));

setup();
}

void init()
{
        add_action("do_break","break");
}

int do_break(string arg)
{
        object me=this_player(),inv;
        if (arg!="boat" && arg!="船") return notify_fail("你要打碎什么？\n");
        inv=present("stone",me);
        if (query("dao")) return notify_fail("船上的桅杆早就倒了，还砸什么？\n");
        if (!objectp(inv)) return notify_fail("你准备拿什么砸船呀？\n");
        else 
        {
        message_vision("$N举起手中"+inv->query("name")+"，向船上的桅杆砸去。\n",me);
        remove_call_out("do_dao");
        call_out("do_dao",3,me);
        return 1;
        }
}

int do_dao(object me)
{
        message_vision( WHT "\n只听得喀喇、喀喇之声不绝，耸立的船桅一根根倒将下来。\n砰嘭之声不绝，顷刻之间，众桅杆或倒或斜，无一得免。\n" NOR,me);
        set("dao",1);
        set("long","这些大船，想是巨鲸帮、海沙派一干人的座船。只是桅杆都被砸断了。\n");
        me->set_temp("dao",1);
        return 1;
}

