inherit NPC;
inherit F_DEALER;

void create()
{
        set_name("阎大夫", ({ "yan daifu", "yan", "daifu" }));
        set("str", 20);
        set("gender", "男性");
        set("age", 18);
        set("long", "阎大夫是凌宵城中的医生，声得称赞。\n");
        set("combat_exp", 250);
        set("attitude", "friendly");
        set("vendor_goods", ({
                "/clone/misc/jinchuang",
                "/clone/misc/yangjing",
                "/clone/misc/dust",
                "/clone/misc/fashao",
                "/clone/misc/shanghan",
                "/clone/misc/xiaoshu",
                "/clone/misc/dongshang",
                "/clone/misc/zhike",
                "/d/shenlong/obj/xionghuang",
        }));

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
