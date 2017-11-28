inherit NPC;
inherit F_MASTER;

#include "quanzhen.h"

void create()
{
        set_name("李志常", ({ "li zhichang", "li", "zhichang" }));
        set("gender", "男性");
        set("age", 24);
        set("class", "taoist");
        set("long", @LONG
他就是全真教第三代弟子中的好手，马钰的大
弟子李志常。他相貌平常，一脸正气。
LONG);
        set("attitude", "friendly");
        set("shen_type", 1);
        set("str", 26);
        set("int", 25);
        set("con", 25);
        set("dex", 26);

        set("max_qi", 2400);
        set("max_jing", 1600);
        set("neili", 3200);
        set("max_neili", 3200);
        set("jiali", 120);

        set("combat_exp", 500000);

        set_skill("force", 160);
        set_skill("quanzhen-xinfa", 160);
        set_skill("dodge", 140);
        set_skill("tianshan-feidu", 140);
        set_skill("parry", 140);
        set_skill("sword", 140);
        set_skill("qixing-jian", 140);
        set_skill("quanzhen-jian", 140);
        set_skill("finger", 120);
        set_skill("zhongnan-zhi", 120);
        set_skill("strike", 120);
        set_skill("chongyang-shenzhang", 120);
        set_skill("literate", 150);
        set_skill("taoism", 150);
        set_skill("martial-cognize", 100);

        map_skill("force", "quanzhen-xinfa");
        map_skill("parry", "quanzhen-jian");
        map_skill("sword", "quanzhen-jian");
        map_skill("dodge", "tianshan-feidu");
        map_skill("finger", "zhongnan-zhi");
        map_skill("strike", "chongyang-shenzhang");

        prepare_skill("finger", "zhongnan-zhi");
        prepare_skill("strike", "chongyang-shenzhang");

        create_family("全真教", 3, "弟子");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: exert_function, "recover" :),
                (: perform_action, "sword.chan" :),
                (: perform_action, "sword.ding" :),
                (: perform_action, "strike.lian" :),
        }));

        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/d/quanzhen/npc/obj/grayrobe")->wear();

}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") < 3000)
        {
                command("say 你行侠仗义之事做得太少，我不能收你。\n");
                return;
        }

        command("say 好吧，我就收下你这个徒弟了。");
        command("recruit " + ob->query("id"));
}
