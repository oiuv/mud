// youngboy.c  苗族少年
inherit NPC;

void create()
{
        set_name("苗族少年", ({ "young boy", "boy" }));
        set("gender", "男性");
        set("age", 20);
       set("per",30);
       set("max_qi",400);
        set("long", "一个身穿苗族服饰的英俊少年。\n");
        set("combat_exp", 8000);
        set("shen_type", 1);
       set_skill("unarmed", 30);
       set_skill("dodge", 30);
        setup();
        carry_object("/d/city/obj/cloth")->wear();
}
