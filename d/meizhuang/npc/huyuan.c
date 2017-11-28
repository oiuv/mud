// huyuan.c

inherit NPC;

void create()
{
        set_name("»¤Ôº", ({ "hu yuan", "yuan", }));

        set("gender", "ÄÐÐÔ");
        set("attitude", "friendly");

        set("age", 30);
        set("shen_type", 1);
        set("str", 17);
        set("int", 24);
        set("con", 20);
        set("dex", 22);
        set("max_qi", 1500);
        set("max_jing", 800);
        set("neili", 1350);
        set("max_neili", 1350);
        set("jiali", 20);
        set("combat_exp", 100000);

        set_skill("force", 80);
        set_skill("dodge", 80);
        set_skill("sword", 100);
        set_skill("parry", 100);

        setup();

        carry_object("/d/city/npc/obj/cloth")->wear();
        carry_object("/d/city/npc/obj/changjian")->wield();
}
