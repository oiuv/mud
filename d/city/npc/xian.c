// xian. 冼老板

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("冼老板", ({ "xian laoban", "xian" }));
	set("title", "醉仙楼老板");
	set("shen_type", 1);

	set("str", 20);
	set("gender", "男性");
	set("age", 45);
	set("long", "洗老板经营祖传下来的醉仙楼已有多年。\n");
	set("combat_exp", 50000);
        set("qi", 300);
        set("max_qi", 300);
	set("attitude", "friendly");
	set_skill("unarmed", 60);
        set_skill("dodge", 60);
        set_temp("apply/attack", 30);
        set_temp("apply/defense", 30);
	set("vendor_goods", ({
		__DIR__"obj/hdjiudai",
		__DIR__"obj/kaoya",
	}));

	setup();
	carry_object("/clone/misc/cloth")->wear();
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
