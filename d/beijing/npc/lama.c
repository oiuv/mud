#include <ansi.h>

inherit NPC;

void create()
{
        set_name("喇嘛", ({"lama", "la ma"}));
        set("long",
        "这是一个高大喇嘛，两臂粗壮，膀阔腰圆，似乎不是中土人士。\n"
        );

        set("gender", "男性");
        set("attitude", "aggressive");
        set("class", "bonze");

        set("age", 20+random(30));
        set("shen_type", -1);
        set("str", 25+random(10));
        set("dex", 25+random(10));
        set("max_qi", 500);
        set("max_jing", 300);
        set("neili", 1500);
        set("max_neili", 1500);
        set("jiaji", 50+random(50));
        set("combat_exp", 50000);
        set("score", 1);

        set_skill("force", 70);
        set_skill("dodge", 70);
        set_skill("unarmed", 70);
        set_skill("parry", 70);
        set_skill("blade", 70);

        setup();

        carry_object("/d/beijing/npc/obj/blade1")->wield();
        carry_object("/d/beijing/npc/obj/jiasha")->wear();
}

void init()
{
        ::init();
        remove_call_out("greeting");
        call_out("greeting", 1, this_player());
}

void greeting(object ob)
{
        object me;
        me = this_object();

        if (! ob || environment(ob) != environment()) return;

        if (userp(ob) && !environment(ob)->query("no_fight"))
        {
                command("say 你是谁，居然敢破坏大爷的好事，不想活了是不是？！");
                kill_ob(ob);
        }       
}

