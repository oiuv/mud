inherit NPC;

void create()
{
        set_name("孔大官人", ({"kong guanren", "kong"}));
        set("long", "开封府中的富户。\n" );
        set("gender", "男性");
        set("attitude", "peace");
        set("age", 42);
        set("str", 20);
        set("int", 16);
        set("con", 20);

        set("combat_exp", 40000);
        set("apply/attack",  30);
        set("apply/defense", 30);
        set_skill("force", 60);
        set_skill("unarmed",60);
        set_skill("blade", 60);
        set_skill("dodge", 60);
        set_skill("parry", 60);
        set_skill("literate", 100);

        setup();
        carry_object("clone/misc/cloth")->wear();
        add_money("silver", 50);
}
