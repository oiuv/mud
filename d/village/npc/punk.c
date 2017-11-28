// punk.c

inherit NPC;

int ask_me();

void create()
{
        set_name("小流氓", ({"punk"}) );
        set("gender", "男性" );
        set("age", 18);
        set("long", "这是一个游手好闲的小流氓。\n");

        set_temp("apply/attack", 10);
        set_temp("apply/defense", 10);
        set("combat_exp", 500);
//	set("shen", -100);
	set("shen_type", -1);
        set("str", 25);
        set("dex", 20);
        set("con", 18);
        set("int", 15);
        set("attitude","heroism");
        set("inquiry", ([
		"王小二" : (: ask_me :),
		"翠花" : 
		"翠花是个小寡妇，她家就在打谷场西边。",
		"鸡" : "鸡是王小二弄来的，味道还真不错。",
        ]) );
        setup();
        set("chat_chance", 10);
        set("chat_msg", ({
"流氓骂骂咧咧的说道：这真他妈的邪唬，老子手里一对天牌，王\n"
"小二这杂种居然就摸出一对至尊来。\n",
"流氓靠着墙角打起瞌睡来了，睡梦中也不知想到了什麽，嘴里哼\n"
"哼道：我看见你哪雪白的大腿，我就起～了～坏～心～喽。\n",
"流氓摸了摸自己的口袋，叹了口气说道：唉，钱都让王小二骗去\n"
"了，不能去找翠花了。\n",
"流氓嘴角露出一丝邪笑，说道：翠花这娘儿们真够劲儿，真她奶\n"
"奶的够～劲～儿!\n",
        }) );
        carry_object(__DIR__"obj/cloth")->wear();
}

int ask_me()
{
        if ( this_player()->query_temp("marks/王") ) {
	    say("流氓说道：你还有完没完? 问话不要钱啊?\n");
	}
	else {
		say(
"流氓说道：王小二啊，他不是本村的人，几个月前来才我们这儿。\n" 
"    跟王小二赌钱总是输，我看他有捣鬼。这小子拳脚挺厉害的。\n"
		);
		write(
"流氓悄声跟你说：你要找王小二的麻烦吧? 他就住在财神庙後面，\n"
"    他在那儿搭了个小棚子。\n");
		this_player()->set_temp("marks/王", 1);
	}
	return 1;
}
