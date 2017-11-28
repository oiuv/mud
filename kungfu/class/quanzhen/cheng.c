inherit NPC;
inherit F_MASTER;

#include "quanzhen.h"

void create()
{
        set_name("程瑶迦", ({ "cheng yaojia", "cheng", "yaojia"}));
        set("gender", "女性");
        set("age", 24);
        set("class", "taoist");
        set("long", "她是清净散人孙不二的弟子。\n");
        set("attitude", "friendly");
        set("shen_type",1);
        set("per", 26);
        set("str", 26);
        set("int", 25);
        set("con", 25);
        set("dex", 26);

        set("str", 28);
        set("int", 25);
        set("con", 25);
        set("dex", 25);

        set("max_qi", 1500);
        set("max_jing", 800);
        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 60);

        set("combat_exp", 200000);

        set_skill("force", 100);
        set_skill("quanzhen-xinfa", 100);
        set_skill("dodge", 120);
        set_skill("tianshan-feidu", 120);
        set_skill("parry", 120);
        set_skill("sword", 120);
        set_skill("qixing-jian", 120);
        set_skill("finger", 100);
        set_skill("zhongnan-zhi", 100);
        set_skill("literate", 100);
        set_skill("taoism", 80);
        set_skill("martial-cognize", 20);

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

        command("say …嗯…那我就暂时收下你好了。");
        command("recruit " + ob->query("id"));
}
