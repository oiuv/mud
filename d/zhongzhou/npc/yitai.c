inherit NPC;

void create()
{
        set_name("姨太太", ({ "yi taitai", "yi", "taitai"}) );
        set("gender", "女性" );
        set("age", 22);
        set("shen_type", -1);
        set("long", "她是周松天的姨太太，打扮得非常的妖艳。\n");

        set("combat_exp", 100);
        set("attitude", "peaceful");
        set_skill("unarmed", 10);
        set_skill("parry", 10);
        set_skill("dodge", 10);

        setup();
        add_money("silver", 1);
        carry_object("clone/misc/cloth")->wear();
        
}
