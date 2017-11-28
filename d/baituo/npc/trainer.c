inherit NPC;

void create()
{
        set_name("教练", ({ "jiao lian", "jiao", "lian" }));
        set("gender", "男性" );
        set("age", 25);
        set("long", "这是个和蔼可亲的教练。\n");
        set("attitude", "friendly");
        set("shen_type", -1);

        set("str", 23);
        set("int", 23);
        set("con", 22);
        set("dex", 20);

        set("max_qi", 300);
        set("max_jing", 300);
        set("neili", 200);
        set("max_neili", 200);
        set("combat_exp", 30000);
        set("score", 20000);

        set_skill("force", 60);
        set_skill("dodge", 70);
        set_skill("unarmed", 70);
        set_skill("parry", 60);
        set_skill("staff",60);

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void attempt_apprentice(object ob)
{
        if (ob->query("born_family") != "欧阳世家")
        {
                command("shake");
                command("say 哪里来的家伙？居然敢来白驼山添乱？");
                return;
        }

        command("say 呵呵，我不收徒，去找欧阳庄主吧。\n");
        return;
}

int accept_fight(object ob)
{
        if (ob->query("born_family") != "欧阳世家")
        {
                command("shake");
                command("say 哪里来的家伙居然敢来白驼山添乱？");
                return 0;
        }

        command("say 这个…你还是自己去练习吧。");
        return 1;
}
