// idle.c 发呆神功

#include <ansi.h>

inherit F_CLEAN_UP;

int main(object me, string arg)
{
        object ob;
        int lvl;
        int n;

        if (me->ban_say(0))
                return 0;

        if (! arg)
                return notify_fail("你要让哪个玩家发呆？\n");

        if (sscanf(arg, "%s %d", arg, n) != 2)
                n = 1;

        if (! objectp(ob = find_player(arg)) || ! me->visible(ob))
                return notify_fail("你要让哪个玩家发呆？\n");

        if (n < 1)
                return notify_fail("你要让别人发呆多久？\n"); 

        if (time() - me->query_temp("last/idle") < 10)
                return notify_fail("如果你要连续使用发呆神功，请使用idle <玩家> <次数>\n");

        if (me == ob)
                return notify_fail("你大脑有水？\n");

        if (wizardp(ob))
                return notify_fail("你的发呆神功等级还没有那么高。\n");

        lvl = me->query_skill("idle-force", 1);
        if (! lvl)
                return notify_fail("你的先学好了发呆神功再说。\n");

        if (lvl < 50)
                return notify_fail("你的发呆神功水平太差，无法施展绝技。\n");

        if (lvl < 300 && environment(ob) != environment(me))
                return notify_fail("你的发呆神功水平有限，无法施展奇术于千里之外！\n");

        if (me->query("jing") < 10 * n)
                return notify_fail("你的精神太差，不能施展这一旷古神功。\n");

        if (me->query("learned_points") + n > me->query("potential"))
                return notify_fail("你的潜能不够，无法施展这一旷古神功。\n");

        me->set_temp("last/idle", time());

        me->receive_damage("jing", 10 * n);
        me->add("learned_points", n);

        message_vision(HIM "$N" HIM "口中念念有词：!@#$%^&，什么意思？\n", me);
        if (random(lvl * lvl) + lvl * lvl < ob->query("combat_exp") ||
            random(lvl) + lvl / 2 < ob->query_skill("idle-force", 1))
        {
                write("没有任何效果，看来你的发呆神功失败了！\n");
                return 1;
        }

        switch(random(4))
        {
        case 0:
                message_vision(HIM "天空突然出现了一个人头，恶狠狠的盯着$N"
                               HIM "，吓得$P" HIM "目瞪口呆，一句话也说不上来。\n" NOR,
                               ob);
                break;
        case 1:
                message_vision(HIM "烟雾中突然窜出两个小鬼，一把抓住$N"
                               HIM "，道：走，该你去报到了！吓得$P"
                               HIM "口吐白沫，几乎晕了过去。\n" NOR,
                               ob);
                break;
        case 2:
                message_vision(HIM "一个人飞也似的跑了过来，大声喊道：" +
                               ob->name() + HIM "！" + ob->name() + HIM "！"
                               "你的股票又跌了！\n$P"
                               HIM "听了一跤摔在了地上，不住的抽搐！\n" NOR,
                               ob);
                break;
        default:
                message_vision(HIM "忽然警铃大作，由远及近，越来越响，$N" +
                               HIM "登时脸色发白，说不出话来！\n" NOR,
                               ob);
                break;
        }

        if (lvl > 180) lvl = 180;
        lvl *= n;

        ob->ban_say_until(lvl, "你被吓傻了，现在说不上话来");
        write(HIC "你的发呆神功成功了，" + ob->name(1) +
              HIC "现在被吓得说不上话来了！\n" NOR);

        CHANNEL_D->do_channel(this_object(), "rumor", "听说" +
                              me->name(1) + HIM "施展发呆神功，" +
                              ob->name(1) + HIM "无辜受害。");
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : idle <玩家> <次数>

这个指令可以让你使某一个玩家不能说话，当你的发呆神功到了
三百级以后可以使不在你面前的玩家闭嘴。运用发呆神功的成功
率与自己的发呆神功等级和对方的经验有关，每使用一次发呆神
功都会耗费一点潜能和一些精。
 
HELP );
        return 1;
}

