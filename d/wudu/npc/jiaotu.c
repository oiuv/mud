inherit NPC;

void create()
{
        set_name("五毒教徒", ({"jiao tu","tu"}));
        set("long", "一个五毒的基层教徒，看来刚入教不久。\n");

        set("gender", "男性");
        set("attitude", "friendly");

        set("age", 25);
        set("shen_type", -1);
        set("str", 20);
        set("int", 30);
        set("con", 25);
        set("dex", 23);
        set("max_qi", 500);
        set("max_jing", 500);
        set("neili", 380);
        set("max_neili", 380);
        set("jiali", 20);
        set("combat_exp", 13000);
        set("chat_chance", 30);

        set_skill("force", 40);
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);

        setup();
        carry_object("/d/city/obj/cloth")->wear();

        setup();
}
