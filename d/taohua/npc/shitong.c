// shitong.c ÊÌÍ¯

inherit NPC;

void create()
{
        set_name("ÊÌÍ¯", ({"shi tong", "tong"}));
        set("age", 8);
        set("gender", "ÄĞĞÔ");
        set("long",
"ÕâÊÇÒ»¸öÌÒ»¨µºÊÔ½£Í¤µÄÊÌÍ¯¡£\n");
        set("attitude", "peaceful");
        set("str", 24);
        set("dex", 16);
        set("combat_exp", 50000);
        set("shen_type", 1);

        set_skill("unarmed", 60);
        set_skill("dodge", 60);
        set_skill("parry", 60);
        set_skill("blade", 80);
        set_skill("force", 60);
        set_temp("apply/attack", 40);
        set_temp("apply/defense", 40);
        set_temp("apply/damage", 20);
        set_temp("apply/armor", 80);

        setup();
        carry_object("/d/city/obj/cloth")->wear();
}
