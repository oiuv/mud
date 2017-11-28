// zhangfang.c

inherit NPC;

int ask_for_gongzi();

void create()
{
        set_name("帐房先生", ({"zhang fang", "zhang", "fang"}));
        set("long",
"他一身邋遢，整天迷迷糊糊的睡不醒模样。\n");
        set("gender", "男性");
        set("attitude", "heroism");

        set("age", 61);
        set("shen_type", 0);
        set("str", 25);
        set("int", 20);
        set("con", 20);
        set("dex", 25);
        set("max_qi", 500);
        set("max_jing", 100);
        set("neili", 500);
        set("max_neili", 500);
        set("jiali", 100);
        set("combat_exp", 1000);
        set("apply/attack",  30);
        set("apply/defense", 30);

        setup();
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 5);
}
