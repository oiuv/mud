// person used in quest

inherit CLASS_D("generate") + "/chinese";

int  accept_object(object who, object ob);

void random_move();
void destruct_me();
int  is_stay_in_room();

void create()
{
        ::create();
        set("gender", "男性" );
        set("age", 30 + random(30));
        set("long", "");
        set("attitude", "friendly");
        set("chat_chance", 30);
        set("chat_msg", ({ (: random_move :) }));
        set("scale", 100);
        set_temp("born_time", time());
        if (clonep()) keep_heart_beat();
}

void set_from_me(object me)
{
        // int exp;

        NPC_D->init_npc_skill(this_object(), NPC_D->check_level(me));
}

int accept_fight(object ob)
{
        command("say 很好！那我就不客气了。");
        kill_ob(ob);
        return 1;
}

int accept_hit(object ob)
{
        command("say 哼！什么人？");
        kill_ob(ob);
        return 1;
}

void random_move()
{
        if (time() - query_temp("born_time") > 900)
        {
                destruct_me();
                return;
        }
        NPC_D->random_move(this_object());
}

int accept_object(object who, object ob)
{
        object rob;
        object bonus;

        if (ob->query("send_to") == query("id"))
        {
                command("nod");
                rob = new("/clone/misc/receipt");
                rob->set("reply_by", query("id"));
                rob->set("reply_to", ob->query("send_from"));
                rob->set("reply_to_name", ob->query("send_from_name"));
                rob->set("receive_from", who->query("id"));
                rob->set("receive_from_name", who->name(1));
                rob->set("long", "这是一封由" + name() + "收到" +
                                 ob->query("send_from_name") + "的来信写的回执。\n");
                command("say 多谢这位" + RANK_D->query_respect(who) + "把信带到，这点钱算是你的辛苦费了。");
                message_vision("$N交给$n一张回执。\n", this_object(), who);
                rob->move(who, 1);

                bonus = new("/clone/money/silver");
                bonus->set_amount(2 + random(5));
                bonus->move(who, 1);

                destruct(ob);
                remove_call_out("destruct_me");
                call_out("destruct_me", 0);
                return 1;
        }

        return 0;
}

void destruct_me()
{
        message_vision("$N急急忙忙的走了。\n", this_object());
        destruct(this_object());
}
