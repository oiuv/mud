// diaoyu.c

inherit NPC;

void create()
{
        set_name("垂钓者", ({ "fishman","diao" }) );
        set("gender", "男性" );
        set("age", 58);
        set("long","一个精神矍烁的老者，他正手持钓竿，稳坐于桥上，很有姜太公之风。\n");
        set("shen_type", 1);
        set("combat_exp", 4000);
        set("str", 15);
        set("dex", 16);
        set("con", 15);
        set("int", 17);
        set("attitude", "friendly");
        setup();
        carry_object("/clone/misc/cloth")->wear();
}

