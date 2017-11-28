#include <ansi.h>

inherit NPC;

void do_chat();

void create()
{
        set_name("张龙", ({"zhang long", "zhang", "long"}));
        set("title", HIY "开封府捕头" NOR);
        set("gender", "男性");
        set("age", 43);
        set("long", @LONG
这便是开封府赫赫有名的捕头张龙，他身体强
壮，看上去武功不错。
LONG );
        set("combat_exp", 600000);
        set("attitude", "heroism");
        set("max_neili", 3000);
        set("neili", 3000);
        set("max_jing", 1000);
        set("jing", 1000);
        set("max_qi", 2000);
        set("qi", 2000);

        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);

        set_skill("unarmed", 160);
        set_skill("sword", 160);
        set_skill("parry", 160);
        set_skill("dodge", 160);
        set_skill("force", 160);
        set_skill("huashan-xinfa", 160);
        set_skill("huashan-jian", 160);
        set_skill("huashan-quanfa", 160);
        set_skill("feiyan-huixiang", 160);
        map_skill("dodge", "feiyan-huixiang");
        map_skill("force", "huashan-neigong");
        map_skill("sword", "huashan-jian");
        map_skill("unarmed", "huashan-quanfa");
        map_skill("parry", "huashan-jian");

        set_temp("born_time", time());

        setup();
        if (clonep()) keep_heart_beat();

        set_max_encumbrance(100000000);
        set_temp("apply/attack", 40);
        set_temp("apply/defense", 40);
        set_temp("apply/damage", 50);
        set_temp("apply/armor", 100);

        carry_object("/d/beijing/npc/obj/sword4")->wield();
        carry_object("/d/beijing/npc/obj/guanfu5")->wear();
}

int do_halt()
{
//      object me;

        if (this_player() == query_temp("catch_ob"))
        {
                write(CYN + name() + "喝道：“贼子，哪里跑！”\n" NOR);
                return 1;
        }

        return 0;
}

int accept_fight(object ob)
{
        message_vision(CYN "$N摇摇头，对$n" CYN "道：“我可没兴趣”。\n" NOR,
                       this_object(), ob);
        return 0;
}

int accept_kill(object ob)
{
        return 1;
}

int accept_hit(object ob)
{
        return 1;
}

void init()
{
        object ob;

        add_action("do_halt", "halt");
        ob = this_player();

        if (is_busy() ||
            is_fighting() ||
            ! living(this_object()) ||
            environment()->query("no_fight"))
                return;

        if (ob == query_temp("catch_ob") ||
            ! query_temp("catch_ob") &&
            ob->query_condition("killer"))
        {
                remove_call_out("catch_killer");
                call_out("catch_killer", 1, ob);
        }
}

void catch_ob(object ob)
{
        remove_enemy(ob);
        message_vision(HIY "$N把铁索往$n" HIY "头上一套，然后拖起$n"
                       HIY "，冷笑道：“跟我走吧！”\n" NOR,
                       this_object(), ob);
        ob->move(this_object());
        if (is_fighting())
        {
                // Am I in fighting now ?
                message_vision(CYN "$N冷冷道：“我先要先回去交"
                               "差了，改日再收拾你们几个！”\n" NOR,
                               this_object());
        }

        if (base_name(environment()) != "/d/changan/baihu1")
        {
                set_temp("old_position", base_name(environment()));
                message_vision(HIR "$N轻声哼了一声，拖着$n" HIR
                               "转身离去。\n" NOR, this_object(), ob);
                move("/d/changan/baihu1");
                remove_call_out("return_back");
                call_out("return_back", 1);
        }

        message_vision(HIW "$N拖着$n" HIW "走了过来，几个狱卒迎了上"
                       "来，把$n" HIW "押进大牢去了。\n" NOR, this_object(), ob);
        CHANNEL_D->do_channel(this_object(), "rumor", "听说" +
                            ob->name(1) + HIM "被开封府总捕头" + name() +
                            "缉拿归案，押入大牢。");
        ob->get_into_prison(0, "/d/changan/prison", 30);
        ob->clear_condition("killer");
        ob->remove_killer(this_object());
        remove_killer(ob);
        delete_temp("catch_ob");
        return;
}

void catch_killer(object ob)
{
        if (! ob || environment(ob) != environment() ||
            ! living(this_object()))
                return;

        if (! living(ob))
        {
                catch_ob(ob);
                return;
        }

        if (is_killing(ob->query("id")))
                return;

        if (ob->name() != ob->name(1) &&
            random((int)ob->query_skill("pretending")) > 50)
                return;

        message_vision(HIY "$N盯着$n" HIY "看了一会儿，突然喝道：“你不"
                       "就是在逃的" + ob->name(1) + HIY "吗？今天撞到我"
                       "的手里，不要想再跑了！”\n" NOR, this_object(), ob);
        set_temp("catch_ob", ob);
        kill_ob(ob);                       
}

void return_back()
{
        if (! living(this_object()))
                return;

        if (! stringp(query_temp("old_position")))
                return;

        message_vision(CYN "$N打了个哈欠，喃喃自语了几声后走开了。\n" NOR,
                       this_object());
        move(query_temp("old_position"));
        message_vision(CYN "$N懒洋洋的走了过来。\n" NOR, this_object());
        delete_temp("old_position");
}

int attack()
{
        object ob;

        if (objectp(ob = query_temp("catch_ob")) &&
            ! living(ob) &&
            environment(ob) == environment())
        {
                catch_ob(ob);
                return 1;
        } else
                return ::attack();
}

void scan()
{
        object ob;

        ::scan();

        if (! objectp(ob = query_temp("catch_ob")))
        {
                if (time() - query_temp("born_time") > 900 &&
                    ! is_fighting() && living(this_object()))
                {
                        message_vision(CYN "$N左顾右盼，悻悻的走了。\n" NOR,
                                       this_object());
                        destruct(this_object());
                }
                return;
        }
        
        if (environment(ob) != environment() ||
            environment(ob)->query("no_fight"))
        {
                message_vision(CYN "$N悻悻道：“哼，岂有此理。”\n" NOR,
                               this_object());
                delete_temp("catch_ob");
                return;
        }

        if (! living(ob))
        {
                catch_ob(ob);
                return;
        }

        if (! is_fighting(ob))
                fight_ob(ob);
}