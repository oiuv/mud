// tongzi.c 童子

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("童子", ({ "tong zi",  }));
        set("long", "这是一个十五六岁的少年，眉清目秀，聪明伶俐，深得岛主喜爱。\n");
        set("gender", "男性");
        set("age", 15);
        set("shen_type",100);
        set("attitude", "peaceful");

        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);

        set("qi", 200);
        set("max_qi", 200);
        set("jing", 200);
        set("max_jing", 200);
        set("neili", 200);
        set("max_neili", 200);
        set("jiali", 10);

        set("combat_exp", 3000);
        set("score", 10);
        set_skill("force", 40);
        set_skill("unarmed", 40);
        set_skill("dodge", 40);
        set_skill("parry", 40);
        set_skill("hand", 40);
        set_skill("staff", 40);

        create_family("侠客岛", 0, "弟子");
        setup();
}
