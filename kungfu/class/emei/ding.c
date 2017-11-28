#include "emei.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("丁敏君", ({ "ding minjun","ding","minjun"}));
        set("long", "她是峨嵋派的第四代俗家弟子。是天下"
                    "最恶心，无赖的人。\n");
        set("gender", "女性");
        set("age", 22);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("class", "fighter");

        set("str", 20);
        set("int", 22);
        set("con", 21);
        set("dex", 24);

        set("max_qi", 1600);
        set("max_jing", 800);
        set("neili", 1800);
        set("max_neili", 1800);
        set("jingli", 1500);
        set("max_jingli", 1500);
        set("combat_exp", 90000);

        set_skill("force", 120);
        set_skill("emei-xinfa", 120);
        set_skill("dodge", 100);
        set_skill("zhutian-bu", 100);
        set_skill("strike", 80);
        set_skill("sixiang-zhang", 80);
        set_skill("hand", 60);
        set_skill("jieshou-jiushi", 60);
        set_skill("parry", 100);
        set_skill("sword", 120);
        set_skill("emei-jian", 120);
        set_skill("literate", 100);
        set_skill("mahayana", 100);
        set_skill("buddhism", 100);
        set_skill("martial-cognize", 20);

        map_skill("force","emei-xinfa");
        map_skill("hand", "jieshou-jiushi");
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
