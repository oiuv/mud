// Npc: /kungfu/class/shaolin/qing-le.c
// Date: YZC 96/01/19

inherit NPC;

string ask_me_1();
string ask_me_2();

STATIC_VAR_TAG string *check_skill = ({
        "buddhism",
        "dodge",
        "shaolin-shenfa",
        "force",
        "parry",
});

void create()
{
	set_name("清乐比丘", ({
		"qingle biqiu",
		"qingle",
		"biqiu",
	}));
	set("long",
		"他是一位体格强健的壮年僧人，他身得虎背熊腰，全身似乎蕴含\n"
		"着无穷劲力。他身穿一袭白布黑边袈裟，似乎身怀武艺。\n"
	);


	set("gender", "男性");
	set("attitude", "friendly");
	set("class", "bonze");

	set("age", 30);
	set("shen_type", 1);
	set("str", 17);
	set("int", 24);
	set("con", 20);
	set("dex", 22);
	set("max_qi", 350);
	set("max_jing", 200);
	set("neili", 350);
	set("max_neili", 350);
	set("jiali", 30);
	set("combat_exp", 5000);
	set("score", 100);

	set_skill("force", 30);
	set_skill("shaolin-xinfa", 30);
	set_skill("dodge", 30);
	set_skill("shaolin-shenfa", 30);
	set_skill("claw", 30);
	set_skill("yingzhua-gong", 30);
	set_skill("parry", 30);
	set_skill("buddhism", 30);
	set_skill("literate", 30);

	map_skill("force", "shaolin-xinfa");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("claw", "yingzhua-gong");
	map_skill("parry", "yingzhua-gong");

	prepare_skill("claw", "yingzhua-gong");

	create_family("少林派", 40, "弟子");

	set("inquiry", ([
		"手谕"       : (: ask_me_1 :),
		"七十二绝艺" : (: ask_me_1 :),
		"达摩令" :     (: ask_me_2 :)
	]));

	setup();

        carry_object("/d/shaolin/obj/qing-cloth")->wear();
}


string ask_me_1()
{
	mapping fam, skl; 
	object ob;
	string *sname;
	int i;
	
	if (!(fam = this_player()->query("family")) || fam["family_name"] != "少林派")
		return RANK_D->query_respect(this_player()) + 
		"与本派素无来往，不知此话从何谈起？";

        if ( (int)this_player()->query("guilty") > 0 )
		return RANK_D->query_respect(this_player()) + 
		"你累犯数戒，身带重罪，我如何能给你这手谕！";

        if ( (int)this_player()->query_int() < 30 )
		return RANK_D->query_respect(this_player()) + 
		"资质不够，不能进入藏经楼。";

	skl = this_player()->query_skills();
	sname  = sort_array( keys(skl), (: strcmp :) );

	for(i=0; i<sizeof(check_skill); i++) {
		if (skl[check_skill[i]] < 100) 
		        return RANK_D->query_respect(this_player()) + 
		               "功力不够，不够资格领取手谕。";
	}

        if ( (int)this_player()->query_skill("buddhism",1) < 150 )
		return RANK_D->query_respect(this_player()) + 
		"想学习上乘武功，先要以高深佛法化解它们的戾气，否则后悔无及。";

	ob = new("/d/shaolin/obj/allow-letter");
	ob->move(this_player());
	message_vision("$N获得一封手谕。\n",this_player());

	return "好吧，凭这封手谕，你可自由进入藏经阁二楼研习上乘武功。";

}

string ask_me_2()
{
	mapping fam; 
	object ob;
	object me;
	int i, n, lvl;

	me = this_player();
	if (!(fam = me->query("family")) || fam["family_name"] != "少林派")
		return RANK_D->query_respect(me) + 
		"与本派素无来往，不知此话从何谈起？";

	n = fam["generation"];
	n = 41 - n;
	lvl = n * 20 + 30;
	
	for(i=0; i< sizeof(check_skill); i++) {
		if (me->query_skill(check_skill[i], 1) < lvl)
		return RANK_D->query_respect(me) +
		       "你" + to_chinese(check_skill[i]) +
                       "的功力不够，不能领取达摩令。";
	}

	ob = new("/d/shaolin/obj/damo-ling");
	ob->move(me);
	message_vision("$N获得一面达摩令。\n",this_player());

	return "好吧，凭这面达摩令，你可自由向你的师尊挑战。";

}
