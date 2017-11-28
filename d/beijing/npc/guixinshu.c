inherit NPC;
inherit F_MASTER;
#include <ansi.h>
void create()
{
	set_name("归辛树", ({ "gui xinshu", "gui" }));
	set("nickname", HIR"神拳无敌"NOR);
	set("title", "华山派三十一代高手");
	set("long", 
"神拳无敌归心树乃华山掌门“神剑仙猿”穆人清的\n"
"二弟子，在江湖早已成名多年，但是近年来极少在\n"
"江湖上走动。\n");
	set("gender", "男性");
	set("age", 78);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 50);
	set("int", 40);
	set("con", 40);
	set("dex", 40);
	
	set("qi", 5000);
	set("max_qi", 5000);
	set("jing", 4000);
	set("max_jing", 4000);
	set("neili", 3000);
	set("max_neili", 3000);
	set("jiali", 200);

	set("combat_exp", 1500000);
	set("score", 200000);

	set_skill("cuff", 220);
	set_skill("force", 140);
	set_skill("dodge", 140);
	set_skill("parry", 140);
	set_skill("strike", 220);
	set_skill("zixia-shengong", 140);
	set_skill("poyu-quan", 220);
	set_skill("hunyuan-zhang", 220);
       set_skill("feiyan-huixiang",140);

	map_skill("cuff", "poyu-quan");
	map_skill("force", "zixia-shengong");
       map_skill("dodge", "feiyan-huixiang");
       map_skill("parry", "poyu-quan");
	map_skill("strike", "hunyuan-zhang");
	prepare_skill("strike", "hunyuan-zhang");
	prepare_skill("cuff", "poyu-quan");

	create_family("华山派", 31, "弟子");

	set("chat_chance_combat", 60);
	set("chat_msg_combat", ({
		(: exert_function, "recover" :),
	}) );

	setup();
	carry_object("/d/beijing/npc/obj/cloth5")->wear();
}

