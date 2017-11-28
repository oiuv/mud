#include <ansi.h>
inherit ITEM;

void create()
{
        set_name(HIG "「忘情天书」" NOR, ({ "wangqing tianshu", "wangqing", "tianshu" }));
        set_weight(3000);
        if (clonep())
                set_default_object(__FILE__);
        else {
                set("long", HIG "传说中的奇书，可忘却尘世间所有烦恼。\n" NOR);
                set("value", 500000);
                set("unit", "本");
        }
}

void init()
{
        add_action("do_read", "read");
}

int do_read(string arg)
{
        object me = this_player();

        if (me->is_busy())
                return notify_fail("你现在正忙着呢。\n");

        if (me->is_fighting())
                return notify_fail("战斗中无法研读。\n");

        if (arg && id(arg))
        {
                if (me->query("skybook/guard/death") >= 1
                   || me->query("combat_exp") > 50000000)
                        return notify_fail(HIW "\n你轻轻翻开书页，突然间一道强"
                                           "光射来，什么都看不清楚。\n" NOR);

                log_file("static/using", sprintf("%s(%s) use 忘情天书 at %s.\n",
                                                 me->name(1), me->query("id"),
                                                 ctime(time())));

                message_vision(HIY "$N" HIY "轻轻翻开" + query("name") + HIY "书"
                               "页，霎时间一道光华闪过$P" HIY "的面庞。\n" NOR, me);

                tell_object(me, HIC "冥冥中你似乎受到了某种的启迪，往日的一切烦"
                                "恼渐渐消逝殆尽。\n" NOR);

                me->add("skybook/guard/death", 1);
                me->start_busy(10);
                destruct(this_object());
                return 1;
        }
}

int query_autoload()
{
        return 1;
}