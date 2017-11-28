#include <ansi.h>
#include "gaibang.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#include "fight.h"

void create()                                                                   
{
        set_name("全冠清", ({ "quan guanqing", "quan", "guanqing" }));
        set("gender", "男性");
        set("long", "这是位沉默寡言却颇有心计的阴毒的丐帮八袋弟子。\n");
        set("title", "丐帮八袋弟子");
        set("nickname", HIY "十方秀才" NOR);
        set("age", 37);
        set("attitude", "peaceful");
        set("class", "beggar");

        set("str", 32);
        set("int", 32);
        set("con", 32);
        set("dex", 32);
        set("max_qi", 2500);
        set("max_jing", 1600);
        set("neili", 2200);
        set("max_neili", 2200);
        set("jiali", 180);
        set("combat_exp", 1200000);

        set_skill("force", 160);
        set_skill("jiaohua-neigong", 160);
        set_skill("dodge", 160);
        set_skill("feiyan-zoubi", 160);
        set_skill("staff", 120);
        set_skill("jiaohua-bangfa", 120);
        set_skill("blade", 160);
        set_skill("liuhe-dao", 160);
        set_skill("unarmed", 140);
        set_skill("changquan", 120);
        set_skill("jueming-tui", 140);
        set_skill("strike", 140);
        set_skill("tongchui-zhang", 140);
        set_skill("parry", 160);
        set_skill("begging", 180);
        set_skill("checking", 180);
        set_skill("literate", 200);
        set_skill("martial-cognize", 160);

        map_skill("force", "jiaohua-neigong");
        map_skill("dodge", "feiyan-zoubi");
        map_skill("blade", "liuhe-dao");
        map_skill("parry", "liuhe-dao");
        map_skill("staff", "jiaohua-bangfa");
        map_skill("strike", "tongchui-zhang");
        map_skill("unarmed", "jueming-tui");

        prepare_skill("strike", "tongchui-zhang");
        prepare_skill("unarmed", "jueming-tui");

        create_family("丐帮", 19, "弟子");

        set("coagents", ({
                ([ "startroom" : "/d/city/ma_zhengting",
                   "id"        : "ma dayuan" ]),
                ([ "startroom" : "/d/city/ma_zhengting",
                   "id"        : "wu changfeng" ]),
                ([ "startroom" : "/d/city/ma_zhengting",
                   "id"        : "xi zhanglao" ]),
        }));

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "strike.kai" :),
                (: perform_action, "unarmed.jue" :),
                (: perform_action, "blade.shan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        set_temp("apply/blade", 100);
        set_temp("apply/damage", 100);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        setup();
        carry_object("/d/gaibang/npc/obj/cloth")->wear();
        carry_object("/clone/weapon/gangdao")->wield();
}

void attempt_apprentice(object ob)
{
        string title = ob->query("title");
        int lvl = ob->query("family/beggarlvl");

        if (! permit_recruit(ob))
                return;

        command("hmm");
        command("say 嗯…也好。你以后就跟着我吧。");
        command("recruit " + ob->query("id"));

        if (ob->query("class") != "beggar")
                ob->set("class", "beggar");

        if (lvl > 0)
        {
                ob->set("family/beggarlvl", lvl);
                ob->set("title", title);
        }
}
