// cong-buqi.c  丛不弃
inherit NPC;
inherit F_MASTER;
#include <ansi.h>

void create()
{
        set_name("丛不弃", ({ "cong buqi", "cong" }) );
        set("gender", "男性");
        set("class", "swordsman");
        set("title", "华山剑宗第十三代弟子");
        set("age", 52);
        set("long", "丛不弃是华山剑宗高手。\n");
        set("attitude", "peaceful");
        set("str", 26);
        set("int", 28);
        set("con", 25);
        set("dex", 26);

        set("max_qi", 3200);
        set("max_jing", 3200);
        set("neili", 3800);
        set("max_neili", 3800);
        set("jiali", 35);

        set("combat_exp", 920000);
        set("shen_type", -1);

        set("chat_chance_combat", 80);
        set("chat_msg_combat", ({
                (: perform_action, "sword.feilong" :),
                (: exert_function, "recover" :),
        }) );

        set_skill("unarmed", 80);
        set_skill("sword", 160);
        set_skill("force", 120);
        set_skill("parry", 160);
        set_skill("dodge", 160);
        set_skill("literate", 50);
        set_skill("huashan-jian", 160);
        set_skill("huashan-xinfa", 120);
        set_skill("huashan-quanfa", 80);
        set_skill("huashan-zhangfa", 80);
        set_skill("huashan-shenfa", 160);

        map_skill("sword", "huashan-jian");
        map_skill("parry", "huashan-jian");
        map_skill("force", "huashan-neigong");
        map_skill("unarmed", "huashan-quanfa");
        map_skill("dodge", "huashan-shenfa");

        create_family("华山剑宗", 13, "弟子");
        setup();

        carry_object("/clone/weapon/changjian")->wield();
        carry_object("/clone/cloth/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        command("say 老夫不想收徒。");
}
