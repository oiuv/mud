// zhongsisao.c

inherit NPC;

void create()
{
	set_name("钟四嫂", ({ "zhong sisao","zhong","sisao" }) );
	set("gender", "女性");
	set("age", 35);
	set("long",
"她就是钟阿四的老婆。凤老爷后院中养了十只肥鹅，忽然不见了一只。家丁\n"
"说是锺家的小二子、小三子兄弟俩偷了，到巡检衙门去告了一状，差役便来\n"
"将锺阿四锁了去整治得奄奄一息。锺四嫂心里一急，便横了心。她赶回家里，\n"
"一手拖了小三子，一手拿了柄菜刀，叫了左右乡邻，一齐上祖庙去。\n"
"锺四嫂在北帝爷爷座前磕了几个响头，说道：‘北帝爷爷，我孩子决不能偷\n"
"人家的鹅。他今年还只四岁，刁嘴拗舌，说不清楚，在财主爷面前说什么吃\n"
"我，吃我！小妇人一家横遭不白，赃官受了贿，断事不明，只有请北帝爷爷\n"
"伸冤！’说着提起刀来，一刀便将小三子的肚子剖了。自己也发疯了。\n");
	set("combat_exp", 20000);
        set("shen_type", 1);
	set("attitude", "aggressive");

	set("apply/attack",  30);
	set("apply/defense", 30);

	set("chat_chance", 5);
	set("chat_msg", ({
		"钟四嫂嘶哑着嗓子喊：‘不卖地，不卖地！没有偷，没有偷。’\n",
		(: random_move :)
	}) );

	set_skill("blade", 30);
	set_skill("unarmed", 50);
	set_skill("parry", 50);
	set_skill("dodge", 50);

	setup();
        carry_object(__DIR__"obj/caidao")->wield();
        carry_object("/clone/misc/cloth")->wear();
}
