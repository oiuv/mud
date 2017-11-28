inherit NPC;
inherit F_MASTER;

#include "emei.h"

void create()
{
        set_name("赵灵珠", ({ "zhao lingzhu","zhao","lingzhu"}));
        set("long", "她是峨嵋派的第四代俗家弟子。\n");
        set("gender", "女性");
        set("age", 22);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "fighter");

        set("str", 20);
        set("int", 22);
        set("con", 20);
        set("dex", 21);

        set("max_qi", 2100);
        set("max_jing", 1000);
        set("neili", 2500);
        set("max_neili", 2500);
        set("combat_exp", 250000);

        set_skill("force", 120);
        set_skill("emei-xinfa", 120);
        set_skill("dodge", 100);
        set_skill("zhutian-bu", 100);
        set_skill("strike", 80);
        set_skill("sixiang-zhang", 80);
        set_skill("finger", 60);
        set_skill("tiangang-zhi", 60);
        set_skill("parry", 100);
        set_skill("sword", 120);
        set_skill("emei-jian", 120);
        set_skill("literate", 100);
        set_skill("mahayana", 100);
        set_skill("buddhism", 100);
        set_skill("martial-cognize", 20);

        map_skill("force","emei-xinfa");
        map_skill("finger","tiangang-zhi");
        map_skill("dodge","zhutian-bu");
        map_skill("strike","sixiang-zhang");
        map_skill("sword","emei-jian");
        map_skill("parry","emei-jian");

        prepare_skill("strike", "sixiang-zhang");

        create_family("峨嵋派", 4, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.xian" :),
                (: perform_action, "strike.xing" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/city/obj/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("say 好吧，我就收下你了。");
        command("recruit " + ob->query("id"));
}
