inherit NPC;
inherit F_MASTER;

#include <command.h>
#include <ansi.h>
#include "emei.h"
#include "tobebonze.h"

void create()
{
        set_name("静和师太", ({ "jinghe shitai","jinghe","shitai"}));
        set("long", "她是一位中年出家道姑，道冠高拢，慈眉善目。\n");
        set("gender", "女性");
        set("age", 45);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "bonze");

        set("str", 25);
        set("int", 19);
        set("con", 24);
        set("dex", 22);

        set("max_qi", 2200);
        set("max_jing", 1100);
        set("neili", 2700);
        set("max_neili", 2700);
        set("combat_exp", 800000);

        set_skill("force", 180);
        set_skill("emei-xinfa", 180);
        set_skill("linji-zhuang", 150);
        set_skill("dodge", 160);
        set_skill("zhutian-bu", 160);
        set_skill("strike", 160);
        set_skill("sixiang-zhang", 160);
        set_skill("jinding-zhang", 160);
        set_skill("finger", 160);
        set_skill("tiangang-zhi", 160);
        set_skill("hand", 160);
        set_skill("jieshou-jiushi", 160);
        set_skill("parry", 160);
        set_skill("sword", 180);
        set_skill("emei-jian", 180);
        set_skill("blade", 180);
        set_skill("yanxing-dao", 180);
        set_skill("literate", 200);
        set_skill("mahayana", 200);
        set_skill("buddhism", 200);
        set_skill("martial-cognize", 100);

        map_skill("force","emei-xinfa");
        map_skill("finger","tiangang-zhi");
        map_skill("dodge","zhutian-bu");
        map_skill("hand", "jieshou-jiushi");
        map_skill("sword","emei-jian");
        map_skill("strike", "jinding-zhang");
        map_skill("blade", "yanxing-dao");
        map_skill("parry","yanxing-dao");

        prepare_skill("hand", "jieshou-jiushi");
        prepare_skill("finger", "tiangang-zhi");

        set("no_teach", ([
                "linji-zhuang" : "临济十二庄需得我师父灭绝师太亲自传授。",
        ]));

        create_family("峨嵋派", 4, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "hand.jie" :),
                (: perform_action, "finger.ling" :),
                (: perform_action, "blade.huan" :),
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

        if ((int)ob->query("shen") < 1000)
        {
                command("say " + RANK_D->query_respect(ob) +
                        "你行侠仗义之事还做的不够。");
                return;
        }

        if ((int)ob->query_skill("mahayana",1) < 50)
        {
                command("say 你大乘涅磐功的修为还不够，提高些再来吧。");
                return;
        }

        command("say 阿弥陀佛，善哉！善哉！好吧，我就收下你了。");
        command("say 希望你能以慈悲之心，以智慧之力，努力行善，济度众生。");
        command("recruit " + ob->query("id"));
}
