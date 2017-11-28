inherit NPC;
void create()
{
        set_name("千夫长", ({ "qianfu zhang", "qianfu", "zhang" }));
        set("age", 32);
        set("gender", "男性");
        set("long", "蒙古汝阳王手下精兵的头领，\n"
                   "体格健壮，神情严肃。\n");
        set("attitude", "peaceful");
        set("str", 25);
        set("dex", 20);
        set("combat_exp", 20000);
        set("shen_type", 1);
        set_skill("unarmed", 90);
        set_skill("dodge", 90);
        set_skill("parry", 90);
        set_skill("club", 90);
        set_skill("force", 90);
        set_skill("zhongping-qiang", 90);
        set_skill("feiyan-zoubi", 90);
        set_skill("huntian-qigong", 90);

        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "huntian-qigong");
        map_skill("club", "zhongping-qiang");

        set_temp("apply/attack", 60);
        set_temp("apply/defense", 60);
        set_temp("apply/damage", 60);
        set_temp("apply/armor", 60);

        setup();
        carry_object("/d/tulong/yitian/npc/obj/spear")->wield();
        carry_object("/d/beijing/npc/obj/guanfu6")->wear();
}
void init()
{
        object ob;
        ::init();
        if (interactive(ob = this_player()) && 
                (int)ob->query_condition("killer")) {
                remove_call_out("kill_ob");
                call_out("kill_ob", 1, ob);
        }
}

int accept_fight(object me)
{
        command("say 大爷我正想找人杀呐，今天算你倒霉。\n");
        me->apply_condition("killer", 500);
        kill_ob(me);
        return 1;
}
