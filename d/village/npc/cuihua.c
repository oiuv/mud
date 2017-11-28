// cuihua.c

inherit NPC;

void create()
{
	set_name("翠花",({ "cui hua", "hua" }) );
        set("gender", "女性" );
        set("age", 25);
        set("long", "这是个打扮很妖艳的少妇，时不时的用眼角向你扫一眼。\n");

//      set("shen", -100);
        set("shen_type", -1);
        set("str", 15);
        set("dex", 18);
        set("con", 15);
        set("int", 17);
        set("combat_exp", 200);
        set_temp("apply/attack", 5);
        set_temp("apply/defense", 10);
        set("attitude", "peaceful");
        setup();
        carry_object(__DIR__"obj/cloth")->wear();
}

