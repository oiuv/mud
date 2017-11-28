// datusi.c

inherit NPC;

void create()
{
	set_name("大土司", ({ "da tusi", "tusi" }));
	set("age", 42);
	set("gender", "男性");
	set("long", "大土司是摆夷族人氏，是苍山纳苏系的。他倒是长的肥头大耳的，
每说一句话，每有一点表情，满脸的肉纹便象是洱海里的波浪一样。
他身着彩绸，头带凤羽，脚踩藤鞋，满身挂着不同色彩的贝壳。只见
他傲气凛然地高居上座，不把来人看在眼里。\n");
	set("attitude", "peaceful");

	set("str", 30);
	set("per", 18);
	set("dex", 36);
	set("combat_exp", 150000);
	set("shen_type", 1);

	set_skill("unarmed", 50);
	set_skill("dodge", 50);
	set_skill("parry", 50);
	set_skill("blade", 50);
	set_skill("force", 50);
	set_temp("apply/attack", 100);
	set_temp("apply/defense", 100);
	set_temp("apply/damage", 100);
	set_temp("apply/armor", 100);

	setup();
	carry_object(__DIR__"obj/lace")->wear();
}
