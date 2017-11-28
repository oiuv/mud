#include <ansi.h>

inherit CLASS_D("generate") + "/chinese";
void random_move();

void create()
{
        mapping my;

        ::create();
        set("gender", "男性" );
        set("age", 30 + random(30));
        set("long", "");
        set("attitude", "friendly");
        set("chat_chance", 30);
        set("chat_msg", ({ (: random_move :) }));
        set("scale", 150);
        set_temp("apply/armor", 30);
        set_temp("apply/damage", 20);
        set_temp("born_time", time());

        NPC_D->init_npc_skill(this_object(), 5 + random(5));

        // 初始化NPC的能力
        my = query_entire_dbase();
        my["max_qi"] = 1500;
        my["max_jing"] = 1500;
        my["max_neili"] = 1000;
        my["eff_jing"] = my["max_jing"];
        my["jing"] = my["max_jing"];
        my["eff_qi"] = my["max_qi"];
        my["qi"] = my["max_qi"];
        my["neili"] = my["max_neili"] * 2;
}

int accept_fight(object ob)
{
        command("say 我可没兴趣陪你玩，快给我滚开。");
        return 0;
}

int accept_hit(object ob)
{
        message_vision(HIW "$N" HIW "脸色一变，闪过一道杀气。怒"
                       "喝道：好一个" + RANK_D->query_rude(ob) +
                       "，来吧！\n" NOR, this_object());
        kill_ob(ob);
        return 1;
}

int accept_kill(object ob)
{
        if (! living(this_object()))
                return 1;

        return accept_hit(ob);
}

int accept_ansuan(object ob)
{
        return notify_fail("那人警惕性好高，你难以下手。\n");
}

int accept_touxi(object ob)
{
        return notify_fail("那人警惕性好高，你难以下手。\n");
}

void random_move()
{
        NPC_D->random_move(this_object());
}

void remove()
{
        if (! environment() || query_temp("die"))
        {
                ::remove();
                return;
        }

        if (! living(this_object()))
        {
                message_vision(WHT "只见一道黑影闪过，将昏迷不醒的$N"
                               WHT "架起，一个飞纵，消失得无影无踪。"
                               "\n" NOR, this_object());
                return;
        }

        message_vision(WHT "$N" WHT "谨慎地看了看四周，急急忙忙的走"
                       "了。\n" NOR, this_object());

        ::remove();
}

void die(object killer)
{
        object ob;
//      string msg;

        if ((objectp(ob = killer)
           || objectp(ob = query_last_damage_from()))
           && ob->query_temp("capture/" + this_object()->query("id")))
        {
                GIFT_D->delay_bonus(ob, ([ "prompt" : "你为六大门派扫清异己",
                                           "exp"    : random(400) + 400,
                                           "pot"    : random(300) + 300,
                                           "score"  : random(40) + 30,
                                           "weiwang": random(30) + 20, ]));
/*
                CHANNEL_D->do_channel(this_object(), "rumor", "听说"
                                      + ob->name(1) + "(" + ob->query("id") +
                                      ")在" + environment()->short() + HIM
                                      "为六大门派击毙了" + name() + "。");
*/
                // 被列为门派中断的自由任务
                if (ob->query("quest/freequest") > 0)
                        GIFT_D->delay_freequest_bonus(ob);
        }
        set_temp("die", 1);
        ::die(killer);
}