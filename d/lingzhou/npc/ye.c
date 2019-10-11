// ye.c

inherit NPC;

#include <ansi.h>;
void create()
{
	set_name("叶二娘", ({ "ye erniang", "ye" }));
	set("gender", "女性");
	set("nickname", HIR"无恶不作"NOR);
	set("age", 43);
	set("str", 25);
	set("dex", 16);
	set("per", 21);
	set("long", "一个中年女子，身穿淡青色长袍，左右脸颊上各有三条血痕。\n");
	set("combat_exp", 300000);
	set("shen_type", -1);
	set("attitude", "peaceful");
	set("neili", 2000); 
	set("max_neili", 2000);
	set("jiali", 100);

	set_skill("strike", 100);
	set_skill("claw", 100);
	set_skill("force", 100);
	set_skill("blade", 100);
	set_skill("dodge", 100);
	set_skill("parry", 100);
	set_skill("sanyin-wugongzhao", 100);
	set_skill("chousui-zhang", 100);
	set_skill("huagong-dafa", 100);
	set_skill("kuangfeng-blade", 100);
	set_skill("shaolin-shenfa", 100);
	map_skill("dodge", "shaolin-shenfa");
	map_skill("force", "huagong-dafa");
	map_skill("blade", "kuangfeng-blade");
	map_skill("parry", "kuangfeng-blade");
	map_skill("claw", "sanyin-wugongzhao");
	map_skill("strike", "chousui-zhang");
	prepare_skill("claw", "sanyin-wugongzhao");
	prepare_skill("strike", "chousui-zhang");

	setup();
	carry_object("/clone/cloth/bupao")->wear();
	carry_object("/clone/weapon/gangdao")->wield();
}

