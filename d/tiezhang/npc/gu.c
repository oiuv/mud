// gu.c 顾炎武
// by pishou and zqb :)

inherit NPC;
//inherit F_SKILL;
int ask_wumu();
int ask_yishu();
int ask_jiannan();
void create()
{
    set_name("顾炎武", ({ "gu yanwu", "gu" }));
    set("long", "顾先生名炎武，字亭林，江苏昆山人士。\n" "顾先生是当世大儒，明亡之后，心伤国变，隐居不仕。\n" "他又高又瘦，面目黝黑。\n");
	set("gender", "男性");
    set("age", 55);

    set_skill("literate", 200);

    set_temp("apply/attack", 10);
    set_temp("apply/defense", 10);
    set_temp("apply/damage", 5);

    set("combat_exp", 500);
	set("shen_type", 1);
	setup();

        set("inquiry", ([
                "画" : "这是二瞻先生的丹青。",
              "二瞻" : "他乃是当今一位大画家。",
            "查士标" : "二瞻先生有位本家伊璜先生牵连在这场‘明史’大案中。",
              "伊璜" : "查伊璜, 也就是查继佐, 因大力将军所助, 免罪不究。", 
              "大力" : "大力将军乃广东提督吴六奇将军。",
            "吴六奇" : "吴六奇将军身在曹营心在汉, 实际上是天地会洪顺堂香主。",
            "天地会" : "天地会是台湾国姓爷延平郡王郑成功手下谋主陈永华所创。",
            "陈永华" : "陈先生暗中联络老兄弟，胸口所刺八字便是会里的口号。",
              "口号" : "天地父母，反清复明。",
          "反清复明" : "你也要学一学当年岳武穆尽忠报国, 刺字以决你心? ",
          "岳武穆" : (: ask_wumu :),
          "武穆遗书" : (: ask_yishu :),
          "上官剑南" : (: ask_jiannan :),
        ]) );
	set("chat_chance", 3);
	set("chat_msg", ({
        "顾炎武高声呤道：清风虽细难吹我，明月何尝不照人？ 真是绝唱！ \n",
        "顾炎武道：如此江山，沦于夷狄。我辈忍气吞声。偷生其间，实令人悲愤填膺。\n",
        "顾炎武道：终有一日驱除胡虏，还我大汉河山，比之徒抒悲愤，更加令人气壮。\n",
        "顾炎武道：当今之世，便真有桃源乐土，咱们也不能独善其身，去躲了起来。\n",
	}) );
}

int ask_wumu()
{
command("say 岳武穆名飞字鹏举，乃抗金的名将，一生用兵如神。据说他死后留下了一部\n"
"武穆遗书，其中记载着他一生戎马生涯的兵法要诀。\n");
return 1;
}

int ask_yishu()
{
command("say 这部遗书最早收藏在皇宫之中，后听说铁掌帮帮主上官剑南率帮中高手，将\n"
"此书偷走，不知是真是假。\n");
return 1;
}

int ask_jiannan()
{
        object zitie, me, ob;

        me = this_object();
        ob = this_player();
        
	zitie = new("/d/tiezhang/obj/zitie");
        if ( present("zitie", ob) )
	{
		command("say 我不是已经告诉你了么，怎么还问？\n");
		return 1;
	}

command("say 这位上官帮主乃是一位侠义之士，铁掌帮自他接任后，力加整顿，多行侠\n"
"义之事，不过数年声势大振，在江湖上侵寻已可以与北方的丐帮分庭抗礼了。只是后来忽\n"
"然消声匿迹，不知所踪了。看来想找到武穆遗书，必先找到上官帮主才行！\n");
command("look " + ob->query("id"));
command("say 看来" + RANK_D->query_respect(ob) + "也是我辈中人，老朽这里有一幅字帖送给你，希望你\n"
"能不忘驱除胡虏，还我河山的志向！");
zitie->move(ob);
message_vision("$N交给$n一幅字帖。\n", me, ob);
return 1;
}

int recognize_apprentice(object ob)
{
	int money=50, level = ob->query_skill("literate", 1);

	if (level>29) money=100;
	if (level>59) money=500;
	if (level>89) money=1000;
	if (level>119) money=5000;

    ob->delete_temp("mark/顾");
	switch(MONEY_D->player_pay(ob, money)) {
		case 0:
		case 2:
			write("你现在的学费是每次" + MONEY_D->money_str(money) + "，请备好零钱。\n");
			return 1;
	}
    ob->set_temp("mark/顾", 1);
	return 1;
}
/*
int accept_object(object who, object ob)
{
	int money=25, level = who->query_skill("literate", 1);

	while (level >= 0) {
		money += money;
		level -= 30;
	}

	if (ob->query("money_id")) {
		if (ob->value() >= money) {
            if ((int)who->query_temp("mark/顾") < 1)
                who->set_temp("mark/顾", 1);
            message_vision("顾炎武同意指点$N一些四书五经的问题。\n", who);
            who->add_temp("mark/顾", ob->value() / money);
			return 1;
		}
		return notify_fail("你现在的学费是每次" + MONEY_D->money_str(money) + "。\n");
	}
	return 0;
}
*/
