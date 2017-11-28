inherit NPC;
inherit F_MASTER;

#include <command.h>
#include <ansi.h>
#include "emei.h"
#include "tobebonze.h"

void create()
{
        set_name("静真师太", ({ "jingzhen shitai","jingzhen","shitai"}));
        set("long", "她是一位中年出家道姑，身穿道袍，正端坐在蒲团上，"
                    "眉目之间有一股祥和之气。\n");
        set("gender", "女性");
        set("age", 42);
        set("attitude", "peaceful");
        set("shen_type", 1);
        set("class", "bonze");

        set("inquiry",([
                "剃度"  : (: ask_for_join :),
                "出家"  : (: ask_for_join :),
                "还俗"  : "峨嵋弟子，不能还俗。你找掌门师太吧。",
        ]));

        set("str", 20);
        set("int", 21);
        set("con", 20);
        set("dex", 22);

        set("max_qi", 2100);
        set("max_jing", 1000);
        set("neili", 2500);
        set("max_neili", 2500);
        set("combat_exp", 110000);

        set_skill("force", 160);
        set_skill("emei-xinfa", 160);
        set_skill("linji-zhuang", 120);
        set_skill("dodge", 140);
        set_skill("zhutian-bu", 140);
        set_skill("strike", 140);
        set_skill("sixiang-zhang", 140);
        set_skill("jinding-zhang", 140);
        set_skill("finger", 140);
        set_skill("tiangang-zhi", 140);
        set_skill("hand", 140);
        set_skill("jieshou-jiushi", 140);
        set_skill("parry", 140);
        set_skill("sword", 160);
        set_skill("emei-jian", 160);
        set_skill("blade", 160);
        set_skill("yanxing-dao", 160);
        set_skill("literate", 180);
        set_skill("mahayana", 180);
        set_skill("buddhism", 180);
        set_skill("martial-cognize", 180);

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
