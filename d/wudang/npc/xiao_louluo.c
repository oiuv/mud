// xiao_louluo.c

inherit NPC;

void create()
{
        set_name("小喽罗", ({"xiao louluo", "louluo"}) );
        set("gender", "男性" );
        set("age", 18);
        set("long", "这是一个年纪不大的小喽罗，象是第一次出来做这无本生意。\n");

        set_temp("apply/attack", 10);
        set_temp("apply/defense", 10);
        set("combat_exp", 500);
		set("shen_type", -1);
        set("str", 25);
        set("dex", 20);
        set("con", 18);
        set("int", 15);
        set("attitude","aggressive");
        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("coin", 10);
}
