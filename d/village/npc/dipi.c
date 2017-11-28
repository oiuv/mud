// dipi.c

inherit NPC;

void create()
{
        set_name("地痞", ({"dipi"}) );
        set("gender", "男性" );
        set("age", 20);
        set("long", "这是一个喝的醉醺醺的地痞。\n");

        set_temp("apply/attack", 15);
        set_temp("apply/defense", 15);
        set("combat_exp", 750);
//	set("shen", -150);
	set("shen_type", -1);
        set("str", 25);
        set("dex", 20);
        set("con", 18);
        set("int", 15);
        set("attitude","heroism");
        setup();
        set("chat_chance", 5);
        set("chat_msg", ({
"地痞迷迷糊糊的喊道：哥俩儿好啊，五魁手啊～～～",
"地痞靠在墙角，发出了阵阵的鼾声。",
        }) );
        carry_object(__DIR__"obj/cloth")->wear();
}

