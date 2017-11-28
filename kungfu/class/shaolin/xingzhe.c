// walker.c
// Date: YZC 96/01/19
// Date: Cleansword 96/02/05

inherit NPC;

void create()
{
	set_name("行者", ({"xingzhe","walker",}));
	set("title", "少林刀僧");
	set("long",
		"他是一位云游四方的行者，风霜满面，行色匆匆，似乎正在办一件急事。\n"
	);

	set("gender", "男性");
	set("attitude", "heroism");
	set("class", "bonze");

	set("chat_chance", 3);

	set("chat_msg", ({
		"行者说道：据说本寺後山山顶上有一个蕴含无上降魔大法的金刚伏魔圈，内有佛家法宝。\n",
                "行者说道：易筋经分为修行篇，攻防篇，身法篇与拳术篇四部，百年前便都已散失各处。\n",
                "行者说道：大金刚拳刚猛狠辣，最厉害的一招名称叫做如来笑，最合佛家超渡世人的本意。\n",
                "行者说道：本寺十八罗汉大阵威力无比，能破阵出关者可说是凤毛麟角，万里挑一的人才。\n",
                "行者说道：本寺弟子自上而下，依次是五圣僧，十八罗汉，九尊者，九禅师，九比丘等。\n",
                "行者说道：戒律院主持是玄痛大师，全寺上下众僧见了他，真是大气也不敢吭一声。\n",
                "行者说道：少林寺藏经楼藏经之富，天下罕有。佛法经典，武功秘籍，可以说是无所不包。\n",
                "行者说道：本寺弟子如要习武防身，可到後殿武器库和防具库领取器械，用後归还所司。\n",
                "行者说道：少林历代有许多高僧在寺内钟楼顶上勤修佛法，七层窗外平台上更是禅定妙处。\n",
                "行者说道：少林绝艺七十二，专精一门，固是大有好处，但如能融贯数艺，则威力更强。\n",
                "行者说道：本寺弟子如能较技战胜师尊辈，便可名列与彼同班，拜师学习更高深的武艺。\n",
		(: random_move :)
	}) );

	set("age", 35);
	set("shen_type", 1);
	set("str", 25);
	set("int", 20);
	set("con", 20);
	set("dex", 25);
	set("max_qi", 500);
	set("max_jing", 100);
	set("neili", 500);
	set("max_neili", 500);
	set("jiali", 30);
	set("combat_exp", 20000);
	set("score", 100);
	set("apply/attack",  30);
	set("apply/defense", 30);

	set_skill("force", 50);
	set_skill("unarmed", 50);
	set_skill("blade", 50);
	set_skill("dodge", 50);
	set_skill("parry", 50);
	set_skill("shaolin-shenfa", 50);
	set_skill("cibei-dao", 50);
	set_skill("shaolin-xinfa", 50);

	map_skill("force", "shaolin-xinfa");
	map_skill("dodge", "shaolin-shenfa");
	map_skill("blade", "cibei-dao");
	map_skill("parry", "cibei-dao");

	setup();
	carry_object("/d/city/obj/gangdao")->wield();
	carry_object("/clone/misc/cloth")->wear();
	add_money("silver", 50);
}
