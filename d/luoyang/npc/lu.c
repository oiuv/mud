inherit NPC;
inherit F_VENDOR;

void create()
{
        set_name("鲁开", ({ "lu kai", "lu", "kai" }) );
        set("gender", "男性" );
        set("age", 32);
        set("long", "这就是木匠铺老板鲁开，他一手绝活扬名洛阳。\n");
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
        set("attitude", "peaceful");
        set_skill("dodge", 20);
        set_skill("unarmed", 20);
        set("chat_chance", 20);
        set("vendor_goods", ({
                "/clone/weapon/mudao",
                "/d/shaolin/obj/qimeigun",
                "/clone/weapon/zhujian",
        }) );

        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
        add_money("coin", 100);
}

void init()
{
        ::init();
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}
