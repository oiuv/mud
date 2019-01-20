// punisher.c

#include <ansi.h>

inherit NPC;

void setup()
{
        add_temp("apply/attack", 300);
        add_temp("apply/defense", 300);
        add_temp("apply/damage", 1000);
        add_temp("apply/unarmed_damage", 1000);
        add_temp("apply/armor", 3000);
        ::setup();
        set_heart_beat(1);
}

void init()
{
        add_action("do_halt", "halt");
}

int do_halt()
{
        // object me;

        if (this_player() == query_temp("punish_ob"))
        {
                write(HIW "听得" + name() + "怒喝道：“逆徒！休走！”\n" NOR);
                return 1;
        }

        return 0;
}

void receive_damage(string type, int amount, object who)
{
        ::receive_damage(type, 1 + amount / 100, who);
}

void receive_wound(string type, int amount, object who)
{
        ::receive_wound(type, 1 + amount / 100, who);
}

mixed hit_ob(object me, object ob, int damage_bouns)
{
        ob->receive_wound("qi", 200 + random(200), me);
        me->set("neili", me->query("max_neili"));
        return HIR "$N" HIR "一招突出，竟然是$n" HIR "闻所未闻，见所未"
               "见的招式，一惊之下，已然受创。\n" NOR;
}

void fight_ob(object ob)
{
	if (is_fighting(ob))
		return;

        if (ob != query_temp("punish_ob") &&
            ! is_fighting(ob))
        {
                message_vision(CYN "$N" CYN "对$n" CYN "冷笑道：我在这"
                               "里清理门户，你插手做甚？\n" NOR,
			       this_object(), ob);
		if (! ob->is_busy())
			ob->start_busy(5);
        }

        ::fight_ob(ob);
	if (! is_killing(ob->query("id")))
        	kill_ob(ob);
}

int accept_fight(object ob)
{
        message_vision(HIW "\n$N" HIW "看了看$n" HIW "，冷笑一声，理也"
                       "不理。\n" NOR, this_object(), ob);
        return 0;
}

int accept_kill(object ob)
{
        return 1;
}

int accept_hit(object ob)
{
        command("say 嘿！且慢！");
        return 1;
}

void start_punish(object ob, string fam)
{
        set_temp("punish_ob", ob);
        set_temp("punishing_fam", fam);
        move(environment(ob));

        message_vision(HIW "只见$N" HIW "走了过来，看到$n" HIW
                       "，冷笑一声。\n" NOR, this_object(), ob);

        if (! this_object()->chat_punish())
        {
                // no chat for punish, use default
                command("chat " + ob->name(1) + "你背叛师门，今日我就为"
                        + fam + "清除门户。留下武功，走你的路！");
        }
        command("follow " + ob->query("id"));

        if (environment(ob)->query("no_fight"))
        {
                tell_object(ob, HIW "你看到" + name() + HIW "追来，不由"
                                "大吃一惊，慌忙转身逃走。\n" NOR);

                message("vision", HIW "只见" + ob->name() + HIW "看到" +
                                  name() + HIW "，脸色大变，慌里慌张的"
                                  "转身逃走。\n\n" NOR + HIR + name() +
                                  HIR "冷笑一声，喝道：“孽徒！那里逃？"
                                  "”紧随其后追了上去。\n" NOR,
                                  environment(ob), ({ ob }));

                ob->move("/d/city/guangchang");
                move("/d/city/guangchang");
                tell_object(ob, HIR "…这……这是哪里？好熟悉啊？你心底"
                                "一横，转过身来，喝道：“不是鱼死，就是"
                                "网破，来吧！”。\n" NOR);

                message("vision", HIW "只见" + ob->name() + HIW "慌慌张"
                                  "张的跑了过来，却见另一人紧随其后。\n"
                                  NOR, environment(ob), ({ ob }));
        }

        command("yun powerup");
        kill_ob(ob);
}

void punish_ob(object ob)
{
        string fam;

        remove_enemy(ob);
        if (living(ob))
                ob->unconcious();

        message_vision(HIY "$N" HIY "一声大喝，陡然一指正点在$n" HIY "的檀"
                       "中大穴之上。\n\n" NOR + CYN "$N" CYN "说道：今日废"
                       "去$n" CYN "毕生武功，饶$p不死，算$p运气。" NOR,
                       this_object(), ob);

        fam = query_temp("punishing_fam");
        ob->add("detach/times", 1);
        ob->add("detach/" + fam, 1);
        if (ob->add("betrayer/times", -(int)ob->query("betrayer/" + fam)) < 1)
                ob->delete("betrayer");
        else
                ob->delete("betrayer/" + fam);

        ob->skill_expell_penalty();

        if (is_fighting())
        {
                // Am I in fighting now ?
                message_vision(HIW "$N" HIW "冷冷道：哼！阁下几位划下的"
                               "道，他日我定当奉陪！\n" NOR,
                               this_object());
        }
        message_vision(HIY "$N" HIY "撇下$n" HIY "，冷笑一声，随即扬长而"
                       "去。\n" NOR, this_object(), ob);

        CHANNEL_D->do_channel(this_object(), "rumor", "听说" +
                            ob->name(1) + HIM "因为背叛师门，被" +
                            name() + HIM "废去一身武功。");
        destruct(this_object());
        return;
}

int attack()
{
        object ob;

        if (objectp(ob = query_temp("punish_ob")) &&
            ! living(ob) &&
            environment(ob) == environment())
        {
                punish_ob(ob);
                return 1;
        } else
                return ::attack();
}

void unconcious()
{
        string fam;
        object ob;

        if (objectp(ob = query_last_damage_from())
           && userp(ob))
        {
        	fam = query_temp("punishing_fam");
        	ob->add("detach/times", 1);
        	ob->add("detach/" + fam, 1);

        	if (ob->add("betrayer/times", -(int)ob->query("betrayer/" + fam)) < 1)
                	ob->delete("betrayer");
        	else
                	ob->delete("betrayer/" + fam);

	        CHANNEL_D->do_channel(this_object(), "rumor", "听说" + ob->name(1) +
                                      HIM "背叛师门后，杀掉了前来追杀的" + name() +
                                      HIM "，终于厚枕无忧。");
        }
        ::die();
}

void scan()
{
        object ob;

        if (! environment())
        {
                destruct(this_object());
                return;
        }

        if (! objectp(ob = query_temp("punish_ob")) ||
            environment(ob) != environment() ||
            environment(ob)->query("no_fight"))
        {
                message_vision(HIW "$N" HIW "收住招式，冷哼一声，随即"
                               "转身离去。\n" NOR, this_object());
                destruct(this_object());
                return;
        }

        if (! living(ob))
        {
                punish_ob(ob);
                return;
        }

        if (! is_fighting(ob))
                fight_ob(ob);

        ::scan();
}
