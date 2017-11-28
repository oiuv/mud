// wangqing.c 忘情仙丹

#include <ansi.h>

inherit ITEM;

void create()
{
        set_name(HIG "忘情仙丹" NOR, ({ "wangqing xiandan", "xiandan", "dan" }));
        set_weight(200);
        if( clonep() )
            set_default_object(__FILE__);
        else {
            set("long", HIG "一粒晶莹剔透的仙丹，传说是太上老君"
                        "精心炼制的灵丹妙药。\n" NOR);
            set("value", 100000000);
            set("unit", "粒");
            set("only_do_effect", 1);
        }
}

int do_effect(object me)
{
        int effect;

        log_file("static/using", sprintf("%s(%s) eat 忘情仙丹 at %s.\n",
                 me->name(1), me->query("id"), ctime(time())));

        effect = 0;
        message_vision("$N一仰脖，吞下了一颗" + this_object()->name() +
                       "。\n", me);

        if (me->query_skill("literate", 1)
           || me->query("learned_literate"))
        {
                effect++;
                write(HIC "嗡的一声，你感觉自己大脑一片空白。\n" NOR);
                me->delete_skill("literate");
                me->delete_skill("calligraphy");
                me->delete_skill("japanese");
                me->delete_skill("mathematics");
                me->delete_skill("count");
                me->delete_skill("qimen-wuxing");
                me->delete_skill("muslim");
                me->delete_skill("russian");
                me->delete_skill("sanscrit");
                me->delete_skill("tadpole");
                me->delete("learned_literate");
                me->add("forgot_literate", 1);
                me->unconcious();
        }

        if (! effect)
                tell_object(me, "不过你觉得好像没什么作用。\n");

        destruct(this_object());
        return 1;
}

