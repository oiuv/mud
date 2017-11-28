// helper for user

#include <ansi.h>

inherit CLASS_D("generate") + "/chinese";

void create()
{
        ::create();
	set("gender", "男性" );
	set("age", 15 + random(20));
	set("long", "");
	set("attitude", "friendly");
        set("chat_chance_combat", 120);
	set_temp("apply/damage", 15);
}

void init_man(mapping p)
{
        mapping my;

        my = query_entire_dbase();
        my["qi"] = my["eff_qi"] = my["max_qi"] = p["life"];
        my["jing"] = my["eff_jing"] = my["max_jing"] = p["life"] / 2;
        my["neili"] = my["max_neili"] = p["neili"];
        my["jingli"] = my["max_jingli"] = p["neili"] / 4;
        my["jiali"] = query_skill("force") / 2;

	set_temp("apply/armor", 100);
}

void kill_ob(object ob)
{
        if (ob->query("family/family_name") == query("family/family_name"))
        {
                message_vision(HIC "$N" HIC "看了看对方，连忙往后一跳，"
                               "大声喊道：“大家住手！有话好说！”\n" NOR,
                               this_object());
                return;
        }

        ::kill_ob(ob);
}

int accept_fight(object ob)
{
        message_vision("$N连连摇头，道：“不必了，我没有兴趣。”\n",
                       this_object());
        return 0;
}

int accept_hit(object ob)
{
        message_vision("$N往后一退，道：“我可没有兴趣和你过招。”\n",
                       this_object());
        return 0;
}

int accept_kill(object ob)
{
        if (ob == query_temp("owner"))
        {
                message_vision("$N向后一退，大声喊道：“所谓合则留，不合"
                               "则去，我是不能侍奉你了！”\n说罢，也不待"
                               "$n回话，自顾去了。\n", this_object(), ob);
                destruct(this_object());
                return -1;
        }

        message_vision("$N一声冷笑，道：“岂有此理！接招吧！”\n",
                       this_object());
	return 1;
}

void destruct_by_owner()
{
        call_out("destruct_me", 1);
}

private void destruct_me()
{
        destruct(this_object());
}

void scan()
{
        object ob;
        object env;
        object *obs;
        object enemy;

        if (objectp(query_temp("renter")))
                return;

        if (! objectp(ob = query_temp("owner")))
        {
                if (environment())
                        message_vision("$N急急忙忙的走了。\n", this_object());
                destruct(this_object());
                return;
        }

        if ((time() - query_temp("help_time")) >= 86400)
        {
                if (environment())
                {
                        command("tell " + ob->query("id") + " 跟随你一年，是"
                                "时候回侠客岛啦，改日再会吧！\n");
                        message_vision("$N急急忙忙的走了。\n", this_object());
                }
                destruct(this_object());
        }

        ::scan();

        env = environment(ob);
        if (environment() == env || ob->is_ghost())
                // 和主人在的地点相同，或是主人处于鬼魂状态
                return;

        if (is_busy() || is_fighting() || ! living(this_object()))
                // 现在忙
                return;

        if (! sizeof(env->query("exits")) ||
            ! sizeof(environment()->query("exits")))
                return;

        message_vision("$N急急忙忙的走开了。\n", this_object());
        if (! move(env)) return;
        obs = filter_array(all_inventory(env),
                           (: $1->is_character() &&
                              $1->is_killing($(ob)->query("id")) &&
                              $1->query_competitor() != $(ob) :));
        if (sizeof(obs))
        {
                message_vision("$N急急忙忙的敢了过来，看见$n正"
                               "在苦斗，当即大喝一声，加入了$n的战团！\n",
                               this_object(), ob);
                foreach (enemy in obs) kill_ob(enemy);
        } else
                message_vision("$N走了过来，站在$n的身后。\n",
                               this_object(), ob);
}
