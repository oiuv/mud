#include "emei.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("方碧琳", ({ "fang bilin","fang","bilin"}));
        set("long", "她是峨嵋派的第四代俗家弟子。\n");
        set("gender", "女性");
        set("age", 20);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "fighter");

        set("str", 16);
        set("int", 22);
        set("con", 21);
        set("dex", 19);

        set("max_qi", 1200);
        set("max_jing", 600);
        set("neili", 1500);
        set("max_neili", 1500);
        set("combat_exp", 70000);

        set_skill("force", 120);
        set_skill("emei-xinfa", 120);
        set_skill("dodge", 100);
        set_skill("zhutian-bu", 100);
        set_skill("strike", 100);
        set_skill("sixiang-zhang", 100);
        set_skill("jinding-zhang", 100);
        set_skill("parry", 100);
        set_skill("blade", 100);
        set_skill("yanxing-dao", 100);
        set_skill("literate", 100);
        set_skill("mahayana", 100);
        set_skill("buddhism", 100);
        set_skill("martial-cognize", 20);

        map_skill("force","emei-xinfa");
        map_skill("dodge","zhutian-bu");
        map_skill("strike", "jinding-zhang");
        map_skill("blade", "yanxing-dao");
        map_skill("parry","yanxing-dao");

        prepare_skill("strike", "jinding-zhang");

        create_family("峨嵋派", 4, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "blade.huan" :),
                (: perform_action, "strike.bashi" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();

        carry_object("/d/city/obj/gangdao")->wield();
        carry_object("/d/city/obj/cloth.c")->wear();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("say 好吧，我就收下你了。");
        command("recruit " + ob->query("id"));
}
