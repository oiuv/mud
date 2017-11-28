inherit NPC;
inherit F_MASTER;

#include "quanzhen.h"

void create()
{
        set_name("崔志方", ({ "cui zhifang", "cui", "zhifang"}));
        set("gender", "男性");
        set("age", 24);
        set("class", "taoist");
        set("long", "他就是全真教第三代弟子中的好手，王处一的二弟子。\n");
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 26);
        set("int", 25);
        set("con", 25);
        set("dex", 26);

        set("max_qi", 2200);
        set("max_jing", 1500);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 100);

        set("combat_exp", 300000);

        set_skill("force", 140);
        set_skill("quanzhen-xinfa", 140);
        set_skill("dodge", 120);
        set_skill("tianshan-feidu", 120);
        set_skill("parry", 120);
        set_skill("sword", 120);
        set_skill("qixing-jian", 120);
        set_skill("strike", 120);
        set_skill("chongyang-shenzhang", 120);
        set_skill("literate", 100);
        set_skill("taoism", 100);
        set_skill("martial-cognize", 60);

        map_skill("force", "quanzhen-xinfa");
        map_skill("parry", "chongyang-shenzhang");
        map_skill("sword", "qixing-jian");
        map_skill("dodge", "tianshan-feidu");
        map_skill("strike", "chongyang-shenzhang");

        prepare_skill("strike", "chongyang-shenzhang");

        create_family("全真教", 3, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
                (: perform_action, "sword.xing" :),
                (: perform_action, "strike.lian" :),
        }));

        setup();
        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();

}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("say 好吧，我就收下你这个徒弟。");
        command("recruit " + ob->query("id"));
}
