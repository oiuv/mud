// sleep.c

#include <ansi.h>
#include <command.h>

void do_makelove(object me, object target);
void do_loving(object me, object target, int wakeup);

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        string no_tell, can_tell;
        object target;
        object where = environment(me);

        seteuid(getuid());

        if (! (where->query("sleep_room"))
             || (where->query("no_sleep_room")))
                return notify_fail("这里做爱可不太好，找个安全点的地方吧！\n");

        if (! arg || ! objectp(target = present(arg, where)))
                return notify_fail("你想和谁做爱？\n");

        if (! target->is_character() || target->query("not_living"))
                return notify_fail("看清楚了，那不是活人！\n");

        if (! target->query("can_speak"))
                return notify_fail("你疯了？想和" + target->name() + "性交？\n");

        if (me == target)
                return notify_fail("你自己要和自己…你还是快回家自己研究吧。\n");

        if (me->is_busy())
                return notify_fail("你现在正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("边动手边做爱？你果然很有创意！\n");

        if (userp(me) && ! wizardp(me) && ! userp(target))
                return notify_fail(target->name() + "一吓，怒视着你。\n");

        if (me->query("gender") == "无性")
                return notify_fail("你这人都这模样了还有兴致？真是少见。\n");

        if (me->query("gender") == target->query("gender"))
                return notify_fail("同性恋么…还是自己好好研究怎么弄吧。\n");

        if (me->query("age") < 16)
                return notify_fail("你还没有发育完全，就想这事？\n");

        if (me->query_temp("pending/makelove") == target)
                return notify_fail("你已经向别人提出要求了，可是人家还没有答应你。\n");

        if (me->query("jing") * 100 / me->query("max_jing") < 80)
                return notify_fail("你的精神不济，现在没有力气和人家做爱。\n");

        if (me->query("qi") * 100 / me->query("max_qi") < 60)
                return notify_fail("你的体力不支，现在没有力气和人家做爱。\n");

        if (me->query("gender") == "男性" &&
            time() - (int)me->query_temp("last_makelove") < 120)
                return notify_fail("你现在是有心无力，没法再来一次。\n");

        no_tell = target->query("env/no_tell");

	if (no_tell == "all" || no_tell == "ALL"
           || is_sub(me->query("id"), no_tell))
        {
                can_tell = target->query("env/can_tell");
                if (! is_sub(me->query("id"), can_tell))
		        return notify_fail("这个人不想听你罗嗦啦。\n");
        }

        if (target->query_temp("pending/makelove") == me)
        {
                target->delete_temp("pending/makelove");
                do_makelove(me, target);
                return 1;
        }

        me->set_temp("pending/makelove", target);
        message("vision", me->name() + "悄悄的和" + target->name() +
                "说了几句话。\n", environment(me), ({ me, target }));

        if (me->query("gender") == "男性")
        {
                me->force_me("tell " + target->query("id") +
                             " 好宝贝，今天就和我欢乐一次吧。");
        } else
        {
                me->force_me("tell " + target->query("id") +
                            " 你现在想要我么？");
        }

        return 1;
}

void do_makelove(object me, object target)
{
        mapping armor;
        string msg;
        string msg1, msg2;
        object man, woman;

        if (armor = me->query_temp("armor") && sizeof(armor))
                me->force_me("remove all");

        if (armor = target->query_temp("armor") && sizeof(armor))
                target->force_me("remove all");

        if (me->query("gender") == "男性")
        {
                man = me;
                woman = target;
        } else
        {
                man = target;
                woman = me;
        }

        msg = "\n$N轻轻搂着$n，双手从$n的脸颊慢慢的抚摸下去直至胸膛，只见$p"
              "不由的颤动了一下，一时间意乱情迷，双手紧紧的抱住了$N，把脸深"
              "深的埋在$N的怀中，磨擦着$P坚实的胸口。霎时间满堂春意，锦绣亦"
              "添光华，两人相互缠绵，渐渐的进入了忘我的状态。\n";

        msg1 = replace_string(msg, "$N", "你");
        msg1 = replace_string(msg1, "$n", woman->name());
        msg1 = replace_string(msg1, "$P", "你");
        msg1 = replace_string(msg1, "$p", "她");

        msg2 = replace_string(msg, "$N", man->name());
        msg2 = replace_string(msg2, "$n", "你");
        msg2 = replace_string(msg2, "$P", "他");
        msg2 = replace_string(msg2, "$p", "你");

        msg = replace_string(msg, "$N", man->name());
        msg = replace_string(msg, "$n", woman->name());
        msg = replace_string(msg, "$P", "他");
        msg = replace_string(msg, "$p", "她");

        msg1 = sort_string(msg1, 54);
        msg2 = sort_string(msg2, 54);
        msg  = sort_string(msg, 54);

        message("vision", HIM + msg1 + NOR, man);
        message("vision", HIM + msg2 + NOR, woman);
        message("vision", HIM + msg + NOR, environment(man), ({ man, woman }));

        tell_object(man, HIR "\n你心情激荡，热血沸腾，一时不能自己……\n" NOR);
        tell_object(woman, HIR "\n你心神一荡，意乱情迷，难以自己……\n" NOR);

        do_loving(man, woman, 15 + random(8));
        do_loving(woman, man, 15 + random(3));
}

void do_loving(object me, object target, int wakeup)
{
        me->set_temp("sleeped", 1);
        me->set_temp("block_msg/all", 1);
        me->disable_player(" <做爱中>");
        me->start_call_out(bind((: call_other, __FILE__, "do_over",
                                   me :), me), wakeup);
        me->set("no_get", 1);
        me->set("no_get_from", 1);
        me->set_temp("last_makelove", time());
        me->add("sex/" + target->name(1), 1);
        me->add("sex/times", 1);

        if (me->query("sex/times") == 1)
                me->set("sex/first", target->name(1));

        if (me->query("gender") == "男性")
        {
                me->set("jing", 20);
                me->set("qi", 50);
        }
}

void do_over(object me)
{
        if (! me || ! me->query_temp("sleeped"))
                return;

        me->delete_temp("sleeped");
	if (living(me)) return;

        me->enable_player();
        me->set_temp("block_msg/all", 0);
        me->delete("no_get");
        me->delete("no_get_from");
        message_vision(HIC "\n$N" HIC "呻吟了一下，慢慢的睁开了眼"
                       "睛，清醒过来。\n\n" NOR, me);
}

int help(object me)
{
        write(@HELP
指令格式：makelove <id>
 
你可以用这个指令想你喜欢的人提出做爱的要求，当然要在安全的地
方。如果对方对你设置了no_tell 的选项，你就无法提出要求。做爱
以后会极大的消耗男方的精和气。

HELP);
        return 1;
}
