inherit NPC;
inherit F_DEALER;

void create() {
    set_name("杨永福", ({ "yang yongfu", "yang", "yongfu" }));
    set("title", "杂货铺老板");
    set("shen_type", 1);
    set("gender", "男性");
    set("age", 45);
    set("long", "杨老板是土生土长的扬州人，做了几十年的小买卖。\n");
    set_skill("unarmed", 50);
    set_skill("dodge", 50);
    set_temp("apply/damage", 15);

    set("combat_exp", 40000);
    set("attitude", "friendly");
    set("vendor_goods", ({
        __DIR__ "obj/mabudai",
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
        __DIR__ "obj/jinsijia",
        "/clone/cloth/cuttonp",
        "/d/xiyu/obj/fire",
        "/d/taohua/obj/bagua",
        "/d/item/obj/chanhs",
        "/clone/misc/wood",
        "/clone/misc/shoeshine",
        "/clone/misc/brush",
        "/clone/misc/sleepbag",
    }));

    setup();
    carry_object("/clone/misc/cloth")->wear();
}

void init() {
    add_action("do_list", "list");
    add_action("do_buy", "buy");
}
