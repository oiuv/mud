inherit NPC;

void create()
{
        set_name("高衙内",({"gao yanei", "gao", "yanei"}));
        set("age", 22);
        set("gender", "男性");
        set("attitude", "peaceful");

        set("str", 25);
        set("dex", 20);
        set("combat_exp", 50000);
        set("shen_type", 1);

        set_skill("unarmed", 80);
        set_skill("dodge", 80);
        set_skill("parry", 80);
        set_skill("sword", 80);
        set_skill("force", 80);
        set_temp("apply/attack", 80);
        set_temp("apply/defense", 80);
        set_temp("apply/damage", 40);
        set_temp("apply/armor", 80);

        setup();
        carry_object("/d/beijing/npc/obj/guanfu4")->wear();
}

int accept_fight(object me)
{
        command("say 大爷我正想找人杀呐，今天算你倒霉。\n");
        kill_ob(me);
        return 1;
}
