//guanjia.c

inherit NPC;

void create()
{
        set_name("¹Ü¼Ò", ({"guan jia", "jia"}) );
        set("gender", "ÄÐÐÔ" );
        set("age", 45);
        set("combat_exp", 9000);
        set("str", 34);
        set("attitude","heroism");
        set("jiali",2);
        set("max_jing",300);
        set("max_qi",300);
        set("max_neili",400);
        set("max_jingli",400);
        set_skill("unarmed",50);
        set_skill("dodge",50);
        set_skill("parry",50);

        setup();
        carry_object(__DIR__"obj/changpao")->wear();
        add_money("coin", 50);
}

