// oldwoman.c

inherit NPC;

void create()
{
        set_name("老大娘", ({ "old woman", "woman" }) );
        set("gender", "女性" );
        set("age", 63);
        set("long", "一个满脸风霜之色的老婆婆。\n");
//	set("shen", 1000);
	set("shen_type", 1);
	set("combat_exp", 150);
        set("env/wimpy", 60);
        set("chat_chance_combat", 50 );
//        set("chat_msg_combat", ({
//               "E)7r=P5@#:I1HKDD#!I1HKDD#!\n",
//              "E)7r=P5@#:SPMA7KDD#!9bLl;/HUOB4r=YDD#!\n",
//                (: command, "surrender" :),
//        }) );
        set("str", 13);
        set("dex", 12);
        set("con", 14);
        set("int", 13);
        set("attitude", "friendly");
        set("inquiry", ([
                "鸡" : "我那老母鸡啊...一定是那几个不务正业的小流氓干的。",
		"流氓" : "那几个小流氓正天不务正业，就在小胡同里喝酒赌钱。"
        ]) );
        setup();
        set("chat_chance", 10);
        set("chat_msg", ({
		"老大娘伤心的说道：那个天杀的，偷了我的老母鸡。\n",
		"老大娘叹了口气，说道：这是个什麽世道啊。\n",
		"老大娘呆呆的望着鸡笼，发起愣来了。\n",
        }) );
	carry_object(__DIR__"obj/cloth")->wear();
	add_money("coin", 100);
}

