// task carrier

#include <ansi.h>

inherit CLASS_D("generate") + "/chinese";


void do_leave();



void create()
{
        string long_desc;
        string *long_list = ({
                "这是一个拾荒者，看上去老实巴交的。不过听\n" +
                "说他和官府有交情，最好别去招惹。\n",
                "\n",
        });
        ::create();
        set("gender", "男性");
        set("age", 53 + random(20));

        long_desc = long_list[random(sizeof(long_list))];
        set("long",long_desc);

        set("attitude", "friendly");
        set("chat_chance", 10);
        set("chat_msg", ({ (: do_leave :) }));
        set("chat_chance_combat", 120);
        set("scale", 150);
        set("no_get", 1);

        set_temp("apply/armor", 100);
        set_temp("apply/damage", 15);
        set_temp("born_time", time());
     //   set_temp("dest_time", 910 + time());

        if (clonep()) keep_heart_beat();
}

void set_from_me(object me)
{
        int exp;
        mapping my;

        NPC_D->init_npc_skill(this_object(), NPC_D->check_level(me));
        my = query_entire_dbase();

        if (my["max_qi"] > 6000)
                my["max_qi"] = 6000;

        if (my["max_jing"] < my["max_qi"] / 2)
                my["max_jing"] = my["max_qi"] / 2;

        if (my["max_jing"] > 3000)
                my["max_jing"] = 3000;

        my["eff_jing"] = my["max_jing"];
        my["jing"] = my["max_jing"];
        my["eff_qi"] = my["max_qi"];
        my["qi"] = my["max_qi"];
        my["quest_count"] = me->query("quest_count");

        exp = me->query("combat_exp") * 11 / 10;
        if (exp > query("combat_exp"))
                set("combat_exp", exp);

        my["jiali"] = query_skill("force") / 3;
        set_temp("dest_time", 910 + time());

}

void kill_ob(object ob)     
{

        if (! is_busy())
                exert_function("powerup");

        ::kill_ob(ob);
}


int accept_fight(object ob)
{
        command("say 好！咱们就比划比划！");
        exert_function("powerup");
        kill_ob(ob);
        return 1;
}

int accept_hit(object ob)
{
        command("say 你死去吧！");
        exert_function("powerup");
        kill_ob(ob);
        return 1;
}

int accept_kill(object ob)
{
        command("say 哼！找死！");
        exert_function("powerup");
        return 1;
}
                     
void do_leave()
{
        random_move();
        if ( time() - query_temp("born_time") > 1150 )
        {
                message_vision("$N急急忙忙的走了。\n", this_object());
                destruct(this_object());
                return;
        }
}

int accept_ask(object me,string arg)
{
        int i;
        object *obj;


        obj = all_inventory(this_object());

                for(i=0; i<sizeof(obj); i++) 
                {
            if ( filter_color( obj[i]->name() ) == arg && ! clonep(obj[i]) )
            {  if ( random(3) == 1 )
               {
                  obj[i]->move(me);

                  message_vision(WHT"$N看了看$n,无奈地说道：“哎，既然被你找到，"
                                 "我也无话可说了。”\n"NOR, this_object(), me);

                  tell_object(me,this_object()->name() + "拿出" +
                              obj[i]->name() + "给你。\n");

                  message("vision", this_object()->name() + "拿出" +
                              obj[i]->name() + "给" + me->name() + "\n",
                              environment(this_object()), ({ me }));


                  message_vision("$N急急忙忙的走了。\n", this_object());
                  destruct(this_object());

                  return 1;
               }
               else
               {       
                   command("say 滚开，少啰嗦!");
                   return 1;
               }
            }
        }
        return 0;
}

void unconcious()
{
    die();
}

void die()
{
     command("say 靠，你来真的，我可不陪你玩了!");
     message_vision("$N急急忙忙的走了。\n", this_object());
     destruct(this_object());

}
