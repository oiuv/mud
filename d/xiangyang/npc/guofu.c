// guofu.c
inherit NPC;
inherit F_MASTER;

void create()
{
    set_name("郭芙", ({"guo fu", "guo", "fu"}));
    set("gender", "女性");
    set("age", 19);
    set("long", "她是郭靖黄蓉的大女儿，东邪黄药师的大外孙女，长得如花似玉。\n");

    set("attitude", "peaceful");
       
    set("per", 30);
    set("str", 18);
    set("int", 30);
    set("con", 21);
    set("dex", 26);

    set("qi", 1000);
    set("max_qi", 1000);
    set("jing", 500);
    set("max_jing", 500);
    set("neili", 500);
    set("max_neili", 500);
    set("jiali", 0);
       
    set("combat_exp", 50000);
    set("score", 0);
       
    set_skill("force", 60);
    set_skill("bibo-shengong", 60);
    set_skill("strike", 60);
    set_skill("luoying-shenzhang", 60);
    set_skill("dodge", 80);
    set_skill("anying-fuxiang", 60);
    set_skill("parry", 60);
    set_skill("sword", 60);
    set_skill("luoying-shenjian", 60);
    set_skill("qimen-wuxing", 60);
       
    map_skill("force"  , "bibo-shengong");
    map_skill("strike", "luoying-shenzhang");
    map_skill("dodge"  , "anying-fuxiang");
    map_skill("sword"  , "luoying-shenjian") ;

    prepare_skill("strike", "luoying-shenzhang");
       
    setup();
    carry_object("/d/taohua/obj/ruanwei")->wear();
    carry_object("/d/taohua/obj/shudai")->wear();

}

