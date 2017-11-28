// meng.c 孟健雄

#include <ansi.h>

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("孟健雄", ({ "meng jianxiong", "meng","jianxiong" }));
	set("nickname", HIC "神弹子" NOR);
	set("long", 
"他是铁胆周仲英的大弟子，对师父忠心耿耿。\n");
	set("gender", "男性");
	set("class", "fighter");
	set("age", 31);
	set("attitude", "friendly");
	set("shen_type", 1);
	set("per", 18);
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);
	
	set("max_qi", 1000);
	set("max_jing", 500);
	set("neili", 500);
	set("max_neili", 500);
	set("jiali", 50);
	set("combat_exp", 60000);

	set_skill("force", 50);
	set_skill("dodge", 50);
	set_skill("unarmed", 50);
	set_skill("parry", 50);
	set_skill("throwing", 50);
	set_skill("mantian-xing", 50);
	set_skill("hunyuan-yiqi", 50);
	set_skill("shaolin-shenfa", 50);
	set_skill("jingang-quan", 50);

	map_skill("dodge", "shaolin-shenfa");
	map_skill("force", "hunyuan-yiqi");
	map_skill("throwing", "mantian-xing");
	map_skill("unarmed", "jingang-quan");
	map_skill("parry", "jingang-quan");

	set("env/wimpy", 20);
	create_family("少林派", 52, "俗家弟子");
 	setup();
	carry_object("/clone/misc/cloth")->wear();
	carry_object(__DIR__"obj/tiedan");
}

