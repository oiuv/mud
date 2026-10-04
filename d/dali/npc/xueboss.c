// xueboss.c

inherit NPC;
inherit F_VENDOR;

void create() {
    set_name("薛老板", ({ "xue laoban", "xue" }));
    set("gender", "男性");
    set("age", 32);
    set("long",
        "这是一个经验老到的生意人，一双精明的眼睛不停的打量着你。\n");
    set("combat_exp", 300);
    set("str", 17);
    set("dex", 20);
    set("con", 17);
    set("int", 22);
    set("attitude", "friendly");
    set("vendor_goods", ({
        __DIR__ "obj/shoes",
        "/d/items/cloth/lvse_doupeng",
        "/d/items/cloth/duijin_guazi",
        "/d/items/cloth/zhaiken_ao",
        "/d/items/cloth/baisha_xiangbianqun",
    }));
    setup();
    carry_object("/clone/cloth/cloth")->wear();
    add_money("coin", 100);
}
void init() {
    ::init();
    add_action("do_buy", "buy");
    add_action("do_list", "list");
}
