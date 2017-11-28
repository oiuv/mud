#include <ansi.h>

inherit NPC;
inherit F_DEALER;

void create()
{
  	set_name("巫攀冰", ({ "wu panbing", "wu", "panbing"}));
  	set("gender","男性");
	set("age", 56);
	set("title", "药铺老板");
	set("combat_exp", 6000);
	set_skill("unarmed", 40);
	set_skill("parry", 40);
	set_skill("dodge", 40);
	set_skill("literate", 20);
	set("chat_chance", 5);
	set("chat_msg", ({
		CYN "巫攀冰拿笔杆敲了敲脑袋，一副恍然大悟的模样。\n" NOR,
		CYN "巫攀冰使劲翻动着三尺厚的帐本。\n" NOR,
		CYN "巫攀冰道：中医之中，要数本草纲目为一绝了。\n" NOR,
	}));
	setup();
	carry_object("/clone/misc/cloth")->wear();
        carry_object("/clone/book/mbook1");
        carry_object("/clone/book/mbook1");
        carry_object("/clone/book/mbook1");
        carry_object("/clone/book/mbook1");
        carry_object("/clone/book/mbook1");
        carry_object("/clone/book/mbook2");
        carry_object("/clone/book/mbook2");
        carry_object("/clone/book/mbook2");
        carry_object("/clone/book/mbook2");
        carry_object("/clone/book/mbook2");
}

void init()
{
        add_action("do_buy", "buy");
        add_action("do_list", "list");
}
