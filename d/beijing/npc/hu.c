inherit NPC;
inherit F_DEALER;

void create() {
    set_name("胡掌柜", ({ "hu zhanggui", "hu" }));
    set("title", "杂货铺老板");
    set("shen_type", 1);

    set("gender", "男性");
    set("age", 45);
    set("long",
        "别看胡掌柜整天懒洋洋的，他心里可盘算得精着呢。\n" +
        "在这北京城能混出个样儿来，再怎么也得有几分本事。\n");
    set_skill("unarmed", 60);
    set_skill("parry", 60);
    set_skill("dodge", 60);
    set_temp("apply/damage", 25);

    set("combat_exp", 50000);
    set("attitude", "friendly");
    set("vendor_goods", ({
        "/d/items/cloth/pi_beixin2",
        "/d/items/pin/xiuhua_zhen",
        "/d/items/boots/xiuhuaxie",
        "/d/items/cloth/fenhong_choushan",
    }));

    setup();
    carry_object("/d/items/cloth/buyi")->wear();
}

void init() {
    add_action("do_list", "list");
    add_action("do_buy", "buy");
}
