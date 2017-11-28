// wei.c 卫春华

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("卫春华", ({ "wei chunhua", "wei","chunhua" }));
	set("title", HIR "红花会"HIG"九当家" NOR);
	set("nickname", HIY "九命锦豹子" NOR);
	set("long", 
"他长得面目英俊，穿一件青布长衫，三十岁左右年纪，双目炯炯，
英气逼人。凡逢江湖上凶殴争斗、对抗官兵之时，卫春华总是不顾
性命的勇往直前，一生所遇凶险不计其数，但连重伤也未受过一次，
是以说他有九条性命。\n");
	set("gender", "男性");
	set("class", "swordsman");
	set("age", 31);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("per", 26);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 1800);
	set("max_jing", 800);
	set("neili", 1000);
	set("max_neili", 1000);
	set("jiali", 100);
	set("combat_exp", 250000);

	set_skill("force", 100);
	set_skill("dodge", 100);
	set_skill("unarmed", 100);
	set_skill("parry", 100);
	set_skill("sword", 100);
	set_skill("houquan", 100);
	set_skill("yunlong-xinfa", 100);
	set_skill("yunlong-shengong", 100);
	set_skill("yunlong-jian", 100);
	set_skill("yunlong-shenfa", 150);

	map_skill("dodge", "yunlong-shenfa");
	map_skill("force", "yunlong-shengong");
	map_skill("unarmed", "houquan");
	map_skill("parry", "yunlong-jian");
	map_skill("sword", "yunlong-jian");

	set("env/wimpy", 20);

 	setup();
	carry_object("/d/wudang/obj/bluecloth")->wear();
	carry_object("/clone/weapon/changjian")->wield();
}

