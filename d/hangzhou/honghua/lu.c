// lu.c 陆菲青

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("陆菲青", ({ "lu feiqing", "lu","feiqing" }));
	set("long", 
"陆菲青，乃武当派大侠，壮年时在大江南北行侠仗义，端的名
震江湖，原是屠龙帮中一位响当当的人物。屠龙帮是反清的秘
帮，雍正年间声势十分浩大，后来雍正、乾隆两朝厉行镇压，
到乾隆七八年时，屠龙帮终于落得瓦解冰消。陆菲青远走边疆。
当时清廷曾四下派人追拿，但他为人机警，兼之武功高强，得
脱大难，但清廷继续严加查缉。陆菲青想到“大隐隐于朝、中
隐隐于市、小隐隐于野”之理，混到李可秀府中设帐教读。\n");
	set("nickname", HIC"绵里针"NOR);
	set("gender", "男性");
	set("class", "scholar");
	set("age", 62);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("per", 23);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 3000);
	set("max_jing", 1000);
	set("neili", 2000);
	set("max_neili", 2000);
	set("jiali", 100);
	set("combat_exp", 1000000);

	set_skill("literate", 100);
	set_skill("force", 200);
	set_skill("dodge", 200);
	set_skill("unarmed", 200);
	set_skill("parry", 200);
	set_skill("blade", 200);
	set_skill("sword", 200);
	set_skill("taiji-quan", 150);
	set_skill("taiji-shengong", 200);
	set_skill("taiji-dao", 200);
	set_skill("taiji-jian", 200);
	set_skill("liangyi-jian", 150);
	set_skill("tiyunzong", 200);

	map_skill("dodge", "tiyunzong");
	map_skill("force", "taiji-shengong");
	map_skill("unarmed", "taiji-quan");
	map_skill("blade", "taiji-dao");
	map_skill("parry", "taiji-jian");
	map_skill("sword", "liangyi-jian");
        set("chat_chance_combat", 60);
        set("chat_msg_combat", ({
                (: perform_action, "sword.ren" :),
                (: exert_function, "powerup" :),
                (: exert_function, "recover" :),
        }) );
	set("env/wimpy", 60);
	create_family("武当派", 17, "掌门");

 	setup();
	carry_object("/d/wudang/obj/greyrobe")->wear();
	carry_object("/clone/weapon/changjian")->wield();
}

