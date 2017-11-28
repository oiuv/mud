// dayou.c 

inherit NPC;
inherit F_GUARDER;

void create()
{
	set_name("陆大有", ({ "lu dayou", "lu", "dayou" }));
	set("nickname", "六猴儿");
	set("long", 
"陆大有身材很瘦，又长的尖嘴猴腮的，但别看他其貌不扬，他在\n"
"同门中排行第六，是华山派年轻一代中的好手。肩上坐着一只小\n"
"猴，一对眼睛四处乱转。\n");
	set("gender", "男性");
	set("age", 26);
	set("attitude", "peaceful");
	set("shen_type", 1);
	set("str", 23);
	set("int", 23);
	set("con", 24);
	set("dex", 28);
	
	set("max_qi", 800);
	set("max_jing", 600);
	set("neili", 800);
	set("max_neili", 800);
	set("jiali", 20);
	set("combat_exp", 50000);
	set("score", 5000);

	set_skill("force", 40);
	set_skill("huashan-xinfa", 40);
	set_skill("dodge", 60);
	set_skill("parry", 50);
	set_skill("sword", 60);
	set_skill("huashan-jian", 60);

	map_skill("force", "huashan-xinfa");
	map_skill("parry", "huashan-jian");
	map_skill("sword", "huashan-jian");

        set("coagents", ({
                ([ "startroom" : "/d/huashan/qunxianguan",
                   "id"        : "yue buqun" ]),
        }));

	create_family("华山派", 14, "弟子");

	setup();
	carry_object("/clone/weapon/changjian")->wield();
}
