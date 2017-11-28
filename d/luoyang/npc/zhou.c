inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("周逸风", ({ "zhou yifeng", "zhou", "yifeng" }));
        set("title", "首饰店老板");
        set("shen_type", 1);
        set("str", 35);
        set("gender", "男性");
        set("age", 45);
        set("combat_exp", 50000);
        set("attitude", "friendly");
        set_skill("unarmed", 60);
        set_skill("dodge", 60);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
        set("vendor_goods", ({
                "/d/changan/npc/obj/ring",
                "/d/changan/npc/obj/wrists",
                "/d/changan/npc/obj/neck",
                "/d/kaifeng/npc/obj/ciwan",
                "/d/kaifeng/npc/obj/luowenhai",
                "/d/kaifeng/npc/obj/bibohu",
        }));

        setup();

        carry_object("/d/changan/npc/obj/choupao")->wear();
        add_money("silver", 50);
}

void init()
{
       add_action("do_buy", "buy");
       add_action("do_list", "list");   
}
