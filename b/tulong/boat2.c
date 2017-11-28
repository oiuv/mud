#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "船上");
        set("long", @LONG
你走到岸边，顿时发现海岸上停泊满了大船。这些大船想
是巨鲸帮、海沙派、神拳门一干人的座船。
LONG);
        set("exits",([
                "northup":__DIR__"daobian",
        ]));

        set("objects",([
                __DIR__"obj/stone": 1,
        ]));
        setup();
}

void init()
{
        add_action("do_break", "break");
}

int do_break(string arg)
{
        object me = this_player(), inv;

        if (arg != "boat" && arg != "船")
                return notify_fail("你要打碎什么？\n");

        inv = present("stone", me);

        if (query("dao"))
		return notify_fail("船上的桅杆早就倒了，还砸什么？\n");

        if (! objectp(inv))
		return notify_fail("你准备拿什么砸船呀？\n");

        message_vision(HIY "$N" HIY "举起手中的" + inv->query("name") +
                       HIY "，向船上的桅杆砸去。\n", me);

        message_vision(WHT "\n顿时只听得喀喇、喀喇之声不绝，耸立的船桅一根"
                       "根倒将下来。\n砰嘭之声不绝，顷刻之间，众桅杆或倒或"
                       "斜，无一得免。\n\n" NOR, me);
        set("dao", 1);
        set("long", @LONG
你走到岸边，顿时发现海岸上停泊满了大船。这些大船想
是巨鲸帮、海沙派、神拳门一干人的座船。只是这些船的桅杆
都被砸断掉了。
LONG);
        me->set_temp("dao", 1);
        return 1;
}
