inherit NPC;
inherit F_MASTER;

#include "quanzhen.h"

void create()
{
        set_name("陈志益", ({ "chen zhiyi", "chen", "zhiyi" }));
        set("gender", "男性");
        set("class", "taoist");
        set("age", 24);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 28);
        set("int", 25);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 1800);
        set("max_jing", 1200);
        set("neili", 2600);
        set("max_neili", 2600);
        set("jiali", 80);

        set("combat_exp", 200000);

        set_skill("force", 120);
        set_skill("quanzhen-xinfa", 120);
        set_skill("dodge", 100);
        set_skill("tianshan-feidu", 100);
        set_skill("parry", 120);
        set_skill("sword", 120);
        set_skill("qixing-jian", 120);
        set_skill("finger", 80);
        set_skill("zhongnan-zhi", 80);
        set_skill("literate", 100);
        set_skill("taoism", 100);
        set_skill("martial-cognize", 40);

        map_skill("force", "quanzhen-xinfa");
        map_skill("parry", "qixing-jian");
        map_skill("sword", "qixing-jian");
        map_skill("dodge", "tianshan-feidu");
        map_skill("finger", "zhongnan-zhi");

        prepare_skill("finger", "zhongnan-zhi");

        create_family("全真教", 3, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
                (: perform_action, "sword.xing" :),
                (: perform_action, "finger.zhi" :),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();

}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("say 好吧，我就收下你这个徒弟。");
        command("recruit " + ob->query("id"));
}
