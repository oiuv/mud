// gonnv.c
inherit NPC;

void create()
{
        set_name("宫女", ({ "gong nv", "nv"}) );
        set("gender", "女性" );
        set("age", 14+random(10));
        set("long", "这是一个宫女,容貌很清秀,看来挺能干.\n");
        set("shen_type", 1);
        set("combat_exp", 3000);
        set("str", 18);
        set("dex", 18);
        set("con", 18);
        set("int", 19);
        set("attitude", "friendly");
        setup();
        carry_object("/clone/misc/cloth")->wear();
}
