inherit NPC;

void create()
{
        set_name("妓女", ({ "ji nv", "ji", "nv" }) );
        set("gender", "女性" );
        set("age", 32);
        set("long",
              "一个千姿百媚的妓女。\n");
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
                "妓女朝着你抛了个媚眼。\n",
        }) );       

        setup();
        carry_object("/d/beijing/npc/obj/jinvcloth")->wear();
        add_money("coin", 30);
}

