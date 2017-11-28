#include <ansi.h>
inherit NPC;

mixed ask_me();

void create()
{
	set_name("孟婆", ({ "meng po", "meng", "po" }) );
	set("title", HIR "奈河桥渡者" NOR);
	set("gender", "女性");
	set("age", 390);
	set("long",
		"这就是奈河桥的孟婆，她面颊深陷，瘦骨零丁。\n");

	set("attitude", "peaceful");
	set("combat_exp", 2500000);

        set("chat_chance", 1);
        set("chat_msg",({
                CYN "孟婆说道：孩子，喝碗汤吧。\n" NOR,
                CYN "孟婆说道：过了奈河桥，前途就艰难了。\n" NOR,
                CYN "孟婆弓着腰煮着孟婆汤。\n" NOR,
                CYN "孟婆轻轻咳嗽了几声。\n" NOR,
        }));

	set("inquiry", ([
		"孟婆汤" : (: ask_me :),
		"汤"     : (: ask_me :),
		"喝汤"   : (: ask_me :),
		"tang"   : (: ask_me :),
	]));

	set("count", 10);

	setup();

	carry_object(__DIR__"obj/cloth3")->wear();
}

mixed ask_me()
{
	//mapping fam; 
	object ob;
        object me = this_player();

        if ( ! me->is_ghost() && ! wizardp(me))
		return "阳人喝什么孟婆汤？";

        if (me->query("combat_exp") < 10000000)
		return "你还是回去吧，这汤…你不喝也罢。";

	if ( present("mengpo tang", this_player()) )
		return "你身上不是还有一碗吗？怎么死了还这么贪心？";

        if (time() - me->query_temp("last_eat/mengpo_tang") < 200)
		return "你不是刚刚才喝了一碗吗？";

	if (query("count") < 1)
		return "汤已经舀完了，待我再煮一锅。";

	ob = new("/d/death/obj/tang");
	ob->move(me);

	add("count", -1);

	message_vision(HIC "\n孟婆弓下腰，舀了一碗孟婆汤递给$N" HIC "。\n\n" NOR, me);
		return "孩子，喝了这汤就该上路了。";
}
