// beep.c

#include <ansi.h>
inherit F_CLEAN_UP;

int help(object me);

void create()
{
        seteuid(getuid());
}

int main(object me, string arg)
{
        object obj;
        string no_tell, can_tell;

        if (((int)me->query("jing") < 50) && (! wizardp(me)))
                return notify_fail("你现在精神不佳，歇会吧。\n");

        if (me->is_busy()) 
                return notify_fail("你现在正忙着呢。\n");
 
        if (! arg || arg == "")
                return notify_fail("你是打算呼叫谁？\n");

        if (arg == me->query("id"))
                return notify_fail("你打算呼叫自己？\n");

        obj = find_player(arg);

        if (! obj || ! me->visible(obj)) 
                return notify_fail("没有这个人。\n");

        no_tell = obj->query("env/no_tell");

        if (wizardp(obj)
           && obj->query("env/invisible")
           && wiz_level(obj) >= wiz_level(me))
                return notify_fail("没有这个人。\n");

        if (! wizardp(me) && (no_tell == "all" || no_tell == "ALL" ||
            is_sub(me->query("id"), no_tell)))
        {
                can_tell = obj->query("env/can_tell");
                if (! is_sub(me->query("id"), can_tell))
                        return notify_fail("这个人不想听你罗嗦啦。\n");
        }

        message_vision(HIC "$N" HIC "弄出一阵刺耳的声响～～～～～\n" NOR, me);
        tell_object(obj, HIW "只听「叮叮叮叮」响个不停，原来是" + me->name(1) +
                         HIW "有事找你。\n" BEEP BEEP NOR);

        call_out("do_beep", 1, obj);
        call_out("do_beep", 2, obj);
        call_out("do_beep", 3, obj);
        call_out("do_beep", 4, obj);

        if (! wizardp(me))
        {
                me->start_busy(2); 
                me->receive_damage("jing", 50);
        }
        return 1;
}

int do_beep(object obj)
{
        if (! obj) return 1;
        tell_object(obj, BEEP);
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式：beep <某人>

只要念出这段传音咒，你想呼叫的人的音箱内便会有提示音发出。

HELP);
        return 1;
}


