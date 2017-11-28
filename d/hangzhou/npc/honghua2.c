inherit NPC;

void create()
{
        set_name("绿营会众", ({ "hui zhong", "hui", "zhong" }) );
        set("gender", "男性");
        set("age", 25);
        set("long", "这是位手执长枪的绿营清兵，红花会在江南\n"
                    "声势大盛，绿营也多有会众。\n");
        set("combat_exp", 20000);
        set("shen_type", 1);
        set("attitude", "heroism");

        set("apply/attack",  30);
        set("apply/defense", 30);

        set_skill("club", 60);
        set_skill("unarmed", 50);
        set_skill("parry", 50);
        set_skill("dodge", 50);

        setup();

        carry_object("/clone/weapon/changqiang")->wield();
        carry_object("/d/city/obj/junfu")->wear();
        add_money("coin", 20);
}
