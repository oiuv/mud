// feed.c 养猪大法

#include <ansi.h>

inherit F_CLEAN_UP;

void create() { seteuid(getuid()); }

int main(object me, string arg)
{
        object ob;
        int lvl;

        if (me->ban_say(0))
                return 0;

        if (! arg)
                return notify_fail("你要送哪个玩家进猪圈？\n");

        if (! objectp(ob = find_player(arg)) || ! me->visible(ob))
                return notify_fail("你要送哪个玩家进猪圈？\n");

        if (me == ob)
                return notify_fail("你大脑有水？\n");

        if (wiz_level(me) < wiz_level(ob))
                return notify_fail("你的养猪水平还没有那么高。\n");

        lvl = me->query_skill("feed-power", 1);
        if (! lvl)
                return notify_fail("你得先学好了养猪大法再说。\n");

        if (lvl < 50)
                return notify_fail("你的养猪水平太差，无法施展绝技。\n");

        if (lvl < 300 && environment(ob) != environment(me))
                return notify_fail("你的养猪水平有限，无法施展奇术于千里之外！\n");

        if (environment(ob) == find_object("/d/city/zhujuan"))
                return notify_fail("此人正在猪圈中享福呢。\n");

        if (! environment(ob)->is_chat_room() && wiz_level(me) < 1)
                return notify_fail("此人所在的地点难以让你施展奇术。\n");

        if (! interactive(ob))
                return notify_fail("此人不在线上，不能养之。\n");

        if (query_idle(ob) < 120)
                return notify_fail("这人现在精神着呢，不好养吧。\n");

        if (ob->query_temp("on_baitan"))
                return notify_fail("这人正在做生意，还是别去打扰。\n");

        if (me->query("jing") < 50)
                return notify_fail("你的精神太差，不能施展这一旷古神功。\n");

        if (me->query("learned_points") + 10 > me->query("potential"))
                return notify_fail("你的潜能不够，无法施展这一旷古神功。\n");

        me->receive_damage("jing", 50);
        me->add("learned_points", 10);

        message_vision(HIM "$N" HIM "口中念念有词：天蓬元帅急急听令，现送上肥猪一头！\n", me);
        if (! wizardp(ob) && (random(lvl * lvl) + lvl * lvl < ob->query("combat_exp") ||
            ob->query("combat_exp") >= 50000))
        {
                write("没有任何效果，看来你这次养猪不成！\n");
                return 1;
        }

        switch(random(4))
        {
        case 0:
                message_vision(HIM "天空现出五彩祥云，天蓬元帅缓缓落下，一把拎起"
                               HIM "$N" HIM "，冷笑两声，架云去了。\n" NOR,
                               ob);
                break;
        case 1:
                message_vision(HIM "天蓬元帅出现在一股烟雾中，一把抓住$N"
                               HIM "，喝道：走，咱们家有事商量，快和我去！\n" NOR,
                               ob);
                break;
        case 2:
                message_vision(HIM "天蓬元帅急急忙忙的跑来，大声喊道：" +
                               ob->name() + HIM "！嫦娥姐姐来了！$N"
                               HIM "一听，慌忙跟在老猪屁股后面颠颠的跑了。\n" NOR,
                               ob);
                break;
        default:
                message_vision(HIM "扑通一下，只见天蓬元帅从天上摔了下来。$N" +
                               HIM "忍不住嘻嘻一笑，元帅大怒：“好家伙，躲在这里？”\n"
                               "一团烟雾过后，只听惨叫连连，$N" HIM "声音渐渐远去。\n" NOR,
                               ob);
                break;
        }

        ob->move("/d/city/zhujuan");
        message("vision", "只听“扑通”一声，" + ob->name() +
                          "掉进了猪圈，继续高声打着呼噜。\n",
                environment(ob), ob);
        write(HIC "你的养猪大法成功了，" + ob->name(1) +
              HIC "现在进猪圈享福去了\n" NOR);

        CHANNEL_D->do_channel(this_object(), "rumor", "听说" +
                              me->name(1) + HIM "施展养猪大法，" +
                              ob->name(1) + HIM "进猪圈继续发呆，长睡不醒。");
        return 1;
}

int help(object me)
{
        write(@HELP
指令格式 : feed <玩家>

如果玩家正在发呆，你有擅长养猪神功，那么可以使用这条指令
将该玩家送进猪圈实习。每使用一次养猪大法都会耗费十点潜能
和一些精。
 
HELP );
        return 1;
}
