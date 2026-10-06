inherit NPC;
inherit F_DEALER;

void create() {
    set_name("萧南忠", ({ "xiao nanzhong", "xiao", "nanzhong" }));
    set("title", "杂货铺老板");
    set("shen_type", 1);
    set("gender", "男性");
    set("age", 45);
    set_skill("unarmed", 50);
    set_skill("dodge", 50);
    set_temp("apply/damage", 15);

    set("combat_exp", 40000);
    set("attitude", "friendly");
    set("vendor_goods", ({
        "/d/city/npc/obj/mabudai",
        "/d/items/cloth/pi_beixin2",
        "/d/items/headwear/tie_toukui",
        "/d/items/neck/xiangquan",
        "/d/items/surcoat/dudai",
        "/d/items/shield/niupi_dun",
        "/d/items/wrists/huwan",
        "/d/items/hands/zhitao",
        "/d/items/waist/huyao",
        "/d/items/boots/caoxie",
        "/d/items/boots/pixue",
        "/d/items/hands/shoutao",
        "/d/items/hands/tieshou",
        "/d/city/npc/obj/jinsijia",
        "/d/xiyu/obj/fire",
    }));

    setup();
    carry_object("/clone/misc/cloth")->wear();
}

void init() {
    add_action("do_list", "list");
    add_action("do_buy", "buy");
}
