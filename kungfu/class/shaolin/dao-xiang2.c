// Npc: /kungfu/class/shaolin/dao-xiang2.c
// Date: YZC 96/01/19

inherit NPC;
inherit F_MASTER;

string ask_me_1();

#include "dao.h"

void create()
{
	set_name("道象禅师", ({
		"daoxiang chanshi",
		"daoxiang",
		"chanshi",
	}));
	set("long",
		"他是一位身材高大的中年僧人，两臂粗壮，膀阔腰圆。他手持兵\n"
		"刃，身穿一袭灰布镶边袈裟，似乎有一身武艺。\n"
	);

	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 40);
	set("shen_type", 1);
	set("str", 20);
	set("int", 20);
	set("con", 20);
	set("dex", 20);
	set("max_qi", 400);
	set("max_jing", 300);
	set("neili", 450);
	set("max_neili", 450);
	set("jiali", 40);
	set("combat_exp", 10000);
	set("score", 100);

	set_skill("force", 50);
	set_skill("hunyuan-yiqi", 50);
        set_skill("shaolin-xinfa", 50);
	set_skill("dodge", 50);
	set_skill("shaolin-shenfa", 50);
	set_skill("strike", 50);
	set_skill("banruo-zhang", 50);
	set_skill("damo-jian", 50);
	set_skill("buddhism", 50);
	set_skill("literate", 50);

	map_skill("force", "hunyuan-yiqi");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("strike", "banruo-zhang");
	map_skill("parry",  "banruo-zhang");

	prepare_skill("strike", "banruo-zhang");

	create_family("少林派", 39, "弟子");

	set("inquiry", ([
		"金创药" : (: ask_me_1 :),
	]));

	set("jin_count", 20);
	setup();

        carry_object("/d/shaolin/obj/dao-cloth")->wear();
}

string ask_me_1()
{
	mapping fam; 
	object ob;
	
	if (!(fam = this_player()->query("family")) || fam["family_name"] != "少林派")
		return RANK_D->query_respect(this_player()) + 
		"与本派素无来往，不知此话从何谈起？";

	if ( (int)this_player()->query_condition("bonze_drug" ) > 0 )
		return RANK_D->query_respect(this_player()) + 
		"你是不是刚吃过药，怎麽又来要了？ 灵药多吃有害无宜，过段时间再来吧。";

	if (  present("jin chuangyao", this_player()) )
		return RANK_D->query_respect(this_player()) + 
		"你现在身上不是有颗药丸吗，怎麽又来要了？ 真是贪得无餍！";

	if (query("jin_count") < 1) return "对不起，金创药已经发完了";

	ob = new("/d/shaolin/obj/jinchuang-yao");
	ob->move(this_player());

	add("jin_count", -1);

	message_vision("$N获得一包金创药。\n",this_player());
	return "好吧，记住，不到危急关头不要轻易使用此药。";

}

