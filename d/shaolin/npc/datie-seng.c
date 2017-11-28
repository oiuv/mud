// datie-seng.c

inherit NPC;

int   ask_qiao();
mixed ask_armor();

string* armors = ({
	"/clone/book/book-iron",
	"/d/shaolin/obj/tieshou",
	"/d/shaolin/obj/tieshou",
	"/d/shaolin/obj/tieshou",
	"/d/shaolin/obj/tieshou",
	"/d/shaolin/obj/tieshou",
	"/d/shaolin/obj/tieshou",
	"/d/shaolin/obj/tieshou",
	"/d/shaolin/obj/tieshou",
	"/d/shaolin/obj/tieshou",
});

void create()
{
	set_name("打铁僧", ({ "datie seng", "datie", "seng" }) );
	set("gender", "男性" );
	set("age", 38);
	set("long", "这是个身强力壮、皮肤拗黑的打铁僧人。\n");
	set("str", 25);
	set("dex", 20);
	set("con", 17);
	set("int", 15);
	set("shen_type", 1);

	set_skill("unarmed", 50);
	set_skill("dodge", 35);
	set_temp("apply/attack", 5);
	set_temp("apply/defense", 5);
	set("combat_exp", 7500);

	set("attitude", "peaceful");
	set("inquiry", ([
		"老乔" : (: ask_qiao :),
		"铁手掌" : (: ask_armor :),
	]));
	set("chat_chance", 3);
	set("chat_msg", ({
	        "打铁僧喃喃自语：让山脚下的老乔给我买铁，结果"
                "送过来的都是些锈得发烂的旧铁！\n",
	        "打铁僧嘟囔道：寺内上等精铁都用得差不多了，得"
                "让慧合尊者派人去市上买些好铁来 ......！\n"
	}));

        set("hand_count", 20);

	setup();
}


int ask_qiao()
{
	if (this_player()->query_temp("marks/问过老乔"))
	{
		command("say 哎呀，我真记不清楚！\n");
	}
   	else
   	{
		command("say 老乔就住在少室山山脚下，好象是"
                        "在东头…还是西头？看我这记性！\n");
		this_player()->set_temp("marks/问过老乔", 1);
	}
	return 1;
}


mixed ask_armor()
{
	object armor, me, ob;

	me = this_object();
	ob = this_player();

	if (present("iron hand", ob))
		return "你不已经有一块了吗？ 这玩意儿有啥用？";

	if (present("iron hand", environment(ob)))
		return "地上这不有一块吗？ 你要的话就捡走吧。";

        if (time() - ob->query_temp("last_ask/for_hand") < 240)
                return "嗯？我不是刚给你一块儿嘛，你还要干啥？";

        if (query("hand_count") < 1)
                return "哦，老乔送了一大堆给我，可是我都送人了。";

	say("铁手掌？ 这玩意儿有啥用？\n"
            "老乔送了一大堆给我，你要的话，就拿一个去罢。\n");

        add("hand_count", -1);
        ob->set_temp("last_ask/for_hand", time());

	armor = new(armors[random(sizeof(armors))]);
	armor->move(ob, 1);

	message_vision("$N交给$n一个铁手掌。\n", me, ob);
	return 1;
}

void reset()
{
        set("hand_count", 20);
}
