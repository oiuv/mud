#include <command.h>
#include <ansi.h>
#include "tobebonze.h"

inherit NPC;

void create()
{
        set_name("静道师太", ({ "jingdao shitai","jingdao","shitai"}));
        set("long", "她是一位中年出家道姑，道冠高拢，慈眉善目。\n");
        set("gender", "女性");
        set("age", 42);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "bonze");

        set("str", 21);
        set("int", 22);
        set("con", 22);
        set("dex", 20);

        set("max_qi", 2300);
        set("max_jing", 1200);
        set("neili", 2500);
        set("max_neili", 2500);
        set("jingli", 700);
        set("max_jingli", 700);
        set("combat_exp", 180000);

        set_skill("force", 140);
        set_skill("emei-xinfa", 140);
        set_skill("dodge", 120);
        set_skill("zhutian-bu", 120);
        set_skill("finger", 120);
        set_skill("tiangang-zhi", 120);
        set_skill("hand", 120);
        set_skill("jieshou-jiushi", 120);
        set_skill("parry", 120);
        set_skill("sword", 120);
        set_skill("emei-jian", 120);
        set_skill("literate", 100);
        set_skill("mahayana", 100);
        set_skill("buddhism", 100);
        set_skill("martial-cognize", 40);

        map_skill("force","emei-xinfa");
        map_skill("finger","tiangang-zhi");
        map_skill("dodge","zhutian-bu");
        map_skill("hand", "jieshou-jiushi");
        map_skill("sword","emei-jian");
        map_skill("parry","emei-jian");

        prepare_skill("hand", "jieshou-jiushi");
        prepare_skill("finger", "tiangang-zhi");

        create_family("峨嵋派", 4, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.jie" :),
                (: perform_action, "finger.ling" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();
        carry_object("/d/city/obj/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command ("say 阿弥陀佛！贫尼不收弟子。\n");
        return;
}
