inherit NPC;

void create()
{
        set_name("闲人", ({ "xian ren", "xian", "ren" }) );
        set("gender", "男性" );
        set("age", 32);
        set("long",
              "一个在街上闲逛的游人。\n");
        set("shen_type", 1);
        set("combat_exp", 10000);
        set("str", 17);
        set("dex", 20);
        set("con", 17);
        set("int", 22);
        set("attitude", "peaceful");
        set_skill("dodge",20);
        set_skill("unarmed",20);
        set("chat_chance", 1);
        set("chat_msg", ({
                "闲人低声嘀咕了一声。\n",
        }) );       

        setup();
        carry_object("/d/beijing/npc/obj/cloth")->wear();
        add_money("coin", 30);
}

