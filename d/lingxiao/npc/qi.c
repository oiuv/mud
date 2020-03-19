#include <ansi.h>

inherit NPC;

void create()
{
        set_name("齐自勉", ({"qi zimian", "qi", "zimian"}));
        set("long", "齐自勉是雪山派掌门人威德先生白自在的师弟。\n");
        set("gender", "男性");
        set("age", 65);
        set("attitude", "friendly");
        set("shen_type", 0);
        set("str", 30);
        set("int", 30);
        set("con", 30);
        set("dex", 30);
        set("max_qi", 3800);
        set("max_jing", 3000);
        set("neili", 4500);
        set("max_neili", 4500);
        set("jiali", 180);
        set("combat_exp", 1000000);

        set_skill("force", 220);
        set_skill("xueshan-neigong", 220);
        set_skill("dodge", 220);
        set_skill("taxue-wuhen", 220);
        set_skill("cuff", 200);
        set_skill("lingxiao-quan", 200);
        set_skill("strike", 200);
        set_skill("piaoxu-zhang", 200);
        set_skill("sword", 240);
        set_skill("hanmei-jian", 240);
        set_skill("yunhe-jian", 240);
        set_skill("xueshan-jian", 240);
        set_skill("parry", 220);
        set_skill("literate", 220);
        set_skill("martial-cognize", 180);

        map_skill("force", "xueshan-neigong");
        map_skill("dodge", "taxue-wuhen");
        map_skill("cuff", "lingxiao-quan");
        map_skill("strike", "piaoxu-zhang");
        map_skill("sword", "xueshan-jian");
        map_skill("parry", "yunhe-jian");

        prepare_skill("strike", "piaoxu-zhang");
        prepare_skill("cuff", "lingxiao-quan");

        create_family("凌霄城", 5, "前辈");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.hui" :),
                (: perform_action, "sword.chu" :),
                (: perform_action, "sword.feng" :),
                (: perform_action, "cuff.jue" :),
                (: perform_action, "strike.piao" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

        setup();
        
        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("say 老夫不收徒，你去找我那些徒儿吧。");
}
