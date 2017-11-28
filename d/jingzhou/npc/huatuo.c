// huatuo.c 华陀二世

inherit NPC;
inherit F_DEALER;

void create()
{
	set_name("华陀二世", ({ "huatuo ershi", "huatuo", "ershi", "hua", "tuo" }));
	set("title", "药铺老板");
	set("gender", "男性");
	set("long", "他就是医术高超的华陀后裔。可是他性格古怪，不是什么人都医的。\n");
	set("age", 65);
	set("int", 30);
	
	set("qi", 1000);
	set("max_qi", 1000);
	set("jing", 1000);
	set("max_jing", 1000);
	set("shen_type", 1);

	set("combat_exp", 500000);
	set("attitude", "heroism");

	set_skill("unarmed", 80);
	set_skill("dodge", 80);
	set_skill("parry", 60);
	set_temp("apply/attack", 70);
	set_temp("apply/defense", 70);
	set_temp("apply/damage", 50);

	setup();
	add_money("gold", 1);
	carry_object("/clone/misc/cloth")->wear();
	carry_object("/clone/book/mbook5");
	carry_object("/clone/book/mbook5");
	carry_object("/clone/book/mbook5");
	carry_object("/clone/book/mbook6");
	carry_object("/clone/book/mbook6");
	carry_object("/clone/book/mbook6");
}

void init()
{
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}
