// menshen.c

#include <ansi.h>
#include <room.h>

inherit ITEM;

void setup() {}

void create()
{
        set_name(HIM "门神" NOR, ({ "men shen", "menshen" }));
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", "这是一张画的五颜六色的门神，常常"
                            "被人贴在门上用来驱除妖邪。\n");
                set("unit", "张");
        }

        set("no_get", 1);
        setup();
}

void init()
{
        object env;
        object me;

        if (! objectp(env = environment()))
                return;

        if (! clonep(env) || base_name(env) != CHAT_ROOM)
                return;

        if (! stringp(env->query("owner_id")) ||
            ! stringp(env->query("startroom")))
                return;

        me = this_player();
        if (! interactive(me) || env->welcome(me))
                return;

        message_vision("门神大喝一声：“何方妖孽，也"
                       "敢来此？”说罢手中铜锤一荡，"
                       "将$N一锤打得飞了出去！\n", me);
        
        if (me->query("id") != "ivy")
                 me->move(env->query("startroom"));

        else message_vision(HIC "门神见闯了祸，退在一边再也不敢说什么了！\n" NOR, me);
        me->start_busy(3);
    
        if (me->query("id") != "ivy")
                message("vision", "只听“蓬”一声，" + me->name() +
                        "飞了出来，身上青一块儿紫一块儿的。\n",
                        environment(me), ({ me }));
}

