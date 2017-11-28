// challenge.c

#include <ansi.h>
#include <command.h>

inherit NPC;

object with_ob = 0;

void competition_with(object ob)
{
        NPC_D->set_from_me(this_object(), ob);
        with_ob = ob;
        command("yun powerup");
        ::competition_with(ob);
}

varargs int receive_damage(string type, int damage, object who)
{
        if (! objectp(with_ob) || objectp(who) && who != with_ob)
                return 0;

        return ::receive_damage(type, damage, who);
}

int accept_fight(object ob)
{
        if (query_competitor() == ob)
                return 1;

        if (ob->is_fightint())
                return notify_fail("人家正在比武呢，你这么出手不太妥当吧！\n");

        if (query("finished"))
                return notify_fail("人家刚比完武，你上去打算干什么？\n");

        return ACCEPT_CMD->main(ob);
}

int accept_hit(object ob)
{
        if (query_competitor() == ob)
                return 1;

        return accept_fight(ob);
}

int accept_kill(object ob)
{
        if (is_killing(ob->query("id")))
                return 1;

        return notify_fail("我看这种丢中原武林脸的事情你还是别作了。\n");
}

int accept_touxi(object ob)
{
        if (is_killing(ob->query("id")))
                return notify_fail("你们正在交手呢，偷袭什么？");

        return notify_fail("我看这种丢中原武林脸的事情你还是别作了。\n");
}

void lost()
{
        object ob;
        object story;
        string msg;
        int expi, poti, weiwangi, scorei;

        if (! objectp(ob = query_competitor()))
                return;

        if (! objectp(story = STORY_D->query_running_story()))
                return;

        story->stop_story();
        msg = query("chat_lost");
        if (! msg) msg = "岂有此理！怎么…怎么可能会这样？";
        command("chat " + msg);
        CHANNEL_D->do_channel(this_object(), "rumor",
                "听说" + ob->name() + "打败了" + name() + "，捍卫了中原武林的尊严。");
        scorei = random(query("combat_exp") / 500) + 50;
        weiwangi = random(query("combat_exp") / 200) + 10;
        expi = random(NPC_D->check_level(this_object()) * 1000) + 10;
        poti = random(5000) + 50;
        ob->add("score", scorei);
        ob->add("weiwang", weiwangi);
        ob->add("combat_exp", expi);
        ob->add("potential", poti);
        tell_object(ob, sprintf(HIC "你获得了%s点经验、%s点潜能，并增"
                                "加了%s点威望、%s点江湖阅历。\n" NOR,
                        chinese_number(expi),
                        chinese_number(poti),
                        chinese_number(weiwangi),
                        chinese_number(scorei)));
        set("finished", 1);
        call_out("destruct", 0, this_object());
        ::lost();
}

void win()
{
        object ob;
        object story;
        string msg;

        if (! objectp(ob = query_competitor()))
                return;

        if (! objectp(story = STORY_D->query_running_story()))
                return;

        story->stop_story();
        ob->add("weiwang", -ob->query("weiwang") / 25);
        command("chat* haha");
        msg = query("chat_win");
        if (! msg) msg = "中原武林，不堪一击！";
        command("chat " + msg);
        CHANNEL_D->do_channel(this_object(), "rumor",
                "听说" + ob->name() + "输给了" + name() + "，丢尽了中原武林的脸面。");
        set("finished", 1);
        call_out("destruct", 0, this_object());
        ::win();
}
