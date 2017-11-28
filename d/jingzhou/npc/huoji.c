// huoji. 药铺伙计

inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("药铺伙计", ({ "yaopu huoji", "huoji" }));
        set("str", 20);
        set("gender", "男性");
        set("age", 18);
        set("long", "他是华神医从乡下招来帮忙的。\n");
        set("combat_exp", 250);
        set("attitude", "friendly");
        set("vendor_goods", ({
                "/d/beijing/obj/yao3",
        }));

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
