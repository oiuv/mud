//yanruyu.c

#include <ansi.h>

inherit NPC;

void create()
{
        set_name("颜如玉", ({ "yan ruyu", "yan", "ruyu" }) );
        set("gender", "女性" );
        set("title",HIM "「一笑倾城」" NOR);
        set("age", 23);
        set("long", 
        "她有倾国倾城之貌，容色丽郁，娇艳绝伦，堪称人间仙子！\n");
    
        set("str", 30);
        set("dex", 40);
        set("con", 30);
        set("int", 40);
        set("per", 40);
        
        set_skill("literate", 300);
        set_skill("yangyan-shu", 300);
        set_skill("force", 150);
        set_skill("yunv-xinjing", 150);
        set_skill("dodge", 150);
        set_skill("rouyun-steps", 150);
        set_skill("unarmed", 150);
        set_skill("parry", 150);
        set_skill("meinv-quan", 150);

        map_skill("force", "yunv-xinjing");
        map_skill("dodge", "rouyun-steps");
        map_skill("parry", "meinv-quan");
        map_skill("unarmed", "meinv-quan");

        prepare_skill("unarmed", "meinv-quan");

        set("combat_exp", 3000000);
        set("max_qi", 1000);
        set("max_jing", 1000);
        set("qi", 1000);
        set("jing", 3000);
        set("neili", 3000);
        set("max_neili", 3000);
        set("attitude", "friendly");

        set("inquiry", ([
                "养颜术" : "爱美之心，人皆有之，来学点养颜术(yangyan-shu)吧。",
                "学费" : "学费至少要白银二十两，给的越多学时越长。",
        ]) );

        setup();
        set("chat_chance", 5);
        set("chat_msg", ({
                "颜如玉说道：爱美之心，人皆有之。\n",
                "颜如玉说道：和我学美容养颜之术吧，能让你从内到外都变漂亮。\n",
                "颜如玉得意地说道：回眸一笑百媚生，六宫粉黛无颜色。\n",
                "颜如玉说道：云想衣裳花想容，春风指槛露华浓，若非群玉山头见，会向瑶台月下逢。\n",
        }) );

        carry_object("/d/changan/npc/obj/skirt")->wear();
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && !is_fighting()) 
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
}

void greeting(object me)
{
        if (! objectp(me) || environment(me) != environment())
                return;

        command("look " + me->query("id"));

        if (me->query("per") < 20)
        {
                command("say 嘻嘻，这位" + RANK_D->query_respect(me) +
                        "要学美容养颜吗？学费很便宜哦。");
        }
}

int recognize_apprentice(object me, string skill)
{
        if (me->query("per") >= 30)
        {
                command("say 再学下去，你就要被人嫉妒的追着砍了！");
                return -1;
        }

        if (skill != "yangyan-shu")
        {
                command("say 我只传授美容养颜之术。");
                return -1;
        }

        if (! (int)me->query_temp("mark/颜"))
                return 0;
        me->add_temp("mark/颜", -1);
        return 1;
}

int accept_object(object who, object ob)
{
        if (!(int)who->query_temp("mark/颜"))
                who->set_temp("mark/颜", 0);

        if (ob->query("money_id") && ob->value() >= 2000)
        {
                message_vision("颜如玉同意传授$N一些美容养颜(yangyan-shu)的经验。\n", who);
                who->add_temp("mark/颜", ob->value() / 100);
                destruct(ob);
                return 1;
        }

        command("say 学费至少要二十两白银，嘻嘻~");
        return 0;
}
